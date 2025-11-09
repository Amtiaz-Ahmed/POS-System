const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const ExcelJS = require("exceljs");

// GET reports page with filter
router.get("/", async (req, res, next) => {
  try {
    let { start, end } = req.query;
    let orders = [];
    let totalEarning = 0;

    if (start && mongoose.isValidObjectId) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = end ? new Date(end) : new Date();
      endDate.setHours(23, 59, 59, 999);

      orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: "delivered",
      }).sort({ createdAt: -1 });

      totalEarning = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // agar end empty tha to UI ke liye default daal do
      if (!end) {
        end = new Date().toISOString().split("T")[0];
      }
    }

    res.render("report", { orders, totalEarning, start, end });
  } catch (err) {
    console.error("❌ Error generating report:", err);
    next(err);
  }
});

// Download Excel
router.get("/download", async (req, res, next) => {
  try {
    const { start, end } = req.query;

    if (!start) {
      return res.status(400).send("Start date required");
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = end ? new Date(end) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: "delivered",
    }).sort({ createdAt: -1 });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    sheet.columns = [
      { header: "Order ID", key: "id", width: 30 },
      { header: "Date", key: "date", width: 25 },
      { header: "Total Amount", key: "total", width: 15 },
    ];

    // Style headers
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // Add rows
    orders.forEach((order) => {
      sheet.addRow({
        id: order._id.toString(),
        date: order.createdAt.toISOString().replace("T", " ").slice(0, 19),
        total: order.totalAmount,
      });
    });

    // Add total row
    const totalRow = sheet.addRow({
      id: "TOTAL",
      date: "",
      total: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    });
    totalRow.font = { bold: true };

    // Send response
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
    console.error("❌ Error downloading Excel:", err);
    next(err);
  }
});

module.exports = router;
