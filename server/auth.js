import { Router } from "express";
import { Buffer } from "node:buffer";
import process from "node:process";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./database.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "mehr-local-dev-secret";

function normalizePhone(value) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s+/g, "")
    .replace(/^\+98/, "0");
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    phone: user.phone,
  };
}

function issueAccessToken(user) {
  return jwt.sign(
    { type: "access" },
    JWT_SECRET,
    {
      subject: String(user.id),
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "نشست نامعتبر است. لطفاً دوباره وارد شوید.",
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    const user = db
      .prepare("SELECT id, full_name, phone FROM users WHERE id = ?")
      .get(Number(payload.sub));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "کاربر پیدا نشد.",
      });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "توکن شما نامعتبر است یا منقضی شده است.",
    });
  }
}

router.get("/me", authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: publicUser(req.user),
  });
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, password } = req.body ?? {};

    if (
      typeof fullName !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "نام، شماره موبایل و رمز عبور را وارد کنید.",
      });
    }

    const cleanName = fullName.trim();
    const cleanPhone = normalizePhone(phone);

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "نام باید بین ۲ تا ۱۰۰ کاراکتر باشد.",
      });
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل باید ۱۱ رقم و با 09 شروع شود.",
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "رمز عبور باید حداقل ۸ کاراکتر، شامل حرف بزرگ، کوچک و عدد باشد.",
      });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE phone = ?")
      .get(cleanPhone);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "این شماره موبایل قبلاً ثبت شده است.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db
      .prepare(`
        INSERT INTO users (full_name, phone, password_hash)
        VALUES (?, ?, ?)
      `)
      .run(cleanName, cleanPhone, passwordHash);

    const user = db
      .prepare(`
        SELECT id, full_name, phone
        FROM users
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: "ثبت‌نام با موفقیت انجام شد. اکنون وارد شوید.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "این شماره موبایل قبلاً ثبت شده است.",
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "ثبت‌نام انجام نشد. دوباره تلاش کنید.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body ?? {};

    if (typeof phone !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل و رمز عبور را وارد کنید.",
      });
    }

    const cleanPhone = normalizePhone(phone);

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل معتبر نیست.",
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(401).json({
        success: false,
        message: "شماره موبایل یا رمز عبور اشتباه است.",
      });
    }

    const user = db
      .prepare(`
        SELECT id, full_name, phone, password_hash
        FROM users
        WHERE phone = ?
      `)
      .get(cleanPhone);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "شماره موبایل یا رمز عبور اشتباه است.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "شماره موبایل یا رمز عبور اشتباه است.",
      });
    }

    const accessToken = issueAccessToken(user);

    return res.json({
      success: true,
      message: "ورود با موفقیت انجام شد.",
      token: accessToken,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "ورود انجام نشد. دوباره تلاش کنید.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { phone } = req.body ?? {};

    if (typeof phone !== "string") {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل را وارد کنید.",
      });
    }

    const cleanPhone = normalizePhone(phone);

    if (!/^09\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل معتبر نیست.",
      });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE phone = ?")
      .get(cleanPhone);

    if (!existingUser) {
      return res.json({
        success: true,
        message: "اگر این شماره ثبت شده باشد، لینک بازیابی برای آن ارسال می‌شود.",
      });
    }

    return res.json({
      success: true,
      message: "درخواست بازیابی برای شماره شما ثبت شد. در نسخه آزمایشی، پیامک/ایمیل واقعی ارسال نمی‌شود.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "درخواست بازیابی انجام نشد. دوباره تلاش کنید.",
    });
  }
});

export default router;
