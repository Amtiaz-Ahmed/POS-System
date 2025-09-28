const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const ExcelJS = require("exceljs");

// GET reports page with filter
router.get("/", async (req, res) => {
  try {
    let { start, end } = req.query;
    let orders = [];
    let totalEarning = 0;

    if (start) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = end ? new Date(end) : new Date(); 
      endDate.setHours(23, 59, 59, 999);

      orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: "delivered"
      });

      totalEarning = orders.reduce((sum, o) => sum + o.totalAmount, 0);

      // agar end empty tha to aaj ka date pass karo taake excel link etc me issue na ho
      if (!end) {
        end = new Date().toISOString().split("T")[0];
      }
    }

    res.render("reports", { orders, totalEarning, start, end });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});

// Download Excel
router.get("/download", async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: "delivered"
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    sheet.columns = [
      { header: "Order ID", key: "id", width: 25 },
      { header: "Date", key: "date", width: 20 },
      { header: "Total", key: "total", width: 15 },
    ];

    orders.forEach(order => {
      sheet.addRow({
        id: order._id.toString(),
        date: order.createdAt.toLocaleString(),
        total: order.totalAmount
      });
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=SalesReport.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading Excel");
  }
});

module.exports = router;
