import express from "express";
import cors from "cors";
import authRouter from "./auth.js";
import "dotenv/config";

const app = express();
const PORT = 3001;
const orders = [];

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ارتباط با سرور مهر برقرار شد.",
  });
});

app.post("/api/orders", (req, res) => {
  const { items = [], total = 0, customer = "کاربر" } = req.body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "سبد خرید خالی است.",
    });
  }

  const order = {
    id: orders.length + 1,
    customer,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  return res.status(201).json({
    success: true,
    message: "سفارش شما با موفقیت ثبت شد.",
    order,
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Mehr API: http://localhost:${PORT}`);
});
