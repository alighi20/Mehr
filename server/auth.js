import { Router } from "express";
import { Buffer } from "node:buffer";
import process from "node:process";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./database.js";

const router = Router();

function normalizePhone(value) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    );
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    phone: user.phone,
  };
}

function issueAccessToken(user) {
  const signingKey = process.env.JWT_SECRET;

  if (!signingKey) {
    throw new Error("Missing JWT signing key");
  }

  return jwt.sign(
    {},
    signingKey,
    {
      subject: String(user.id),
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

// ثبت‌نام
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

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "رمز عبور باید حداقل ۸ کاراکتر باشد.",
      });
    }

   if (Buffer.byteLength(password, "utf8") > 72) {
  return res.status(400).json({
    success: false,
    message: "رمز عبور بیش از حد طولانی است؛ حداکثر ۷۲ بایت.",
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

// ورود
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body ?? {};

    if (
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
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

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
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

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

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

export default router;
