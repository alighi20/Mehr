import express from "express";
import cors from "cors";
import authRouter from "./auth.js";
import "dotenv/config";


const app = express();
const PORT = 3001;

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

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Mehr API: http://localhost:${PORT}`);
});
