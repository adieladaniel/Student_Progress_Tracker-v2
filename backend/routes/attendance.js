import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * POST /api/attendance
 * Save or update attendance
 */
router.post("/", async (req, res) => {
  const { date, rollno, name, className, branch, status } = req.body;

  if (!date || !rollno || !name || !className || !branch || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.query(
      `
      INSERT INTO attendance (date, rollno, name, class, branch, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = ?
      `,
      [date, rollno, name, className, branch, status, status]
    );

    res.json({ success: true, message: "Attendance saved" });
  } catch (err) {
    console.error("Attendance save error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/**
 * GET /api/attendance
 * Fetch attendance
 * Supports:
 * 1) Student dashboard
 * 2) Class-level view (future)
 */
router.get("/", async (req, res) => {
  const { rollno, className, branch } = req.query;

  try {
    // 🧠 Student-specific (personal dashboard)
    if (rollno && className && branch) {
      const [rows] = await db.query(
        `
        SELECT date, status
        FROM attendance
        WHERE rollno = ?
          AND class = ?
          AND branch = ?
        ORDER BY date DESC
        `,
        [rollno, className, branch]
      );
      return res.json(rows);
    }

    // 🧠 Class-level (optional / future use)
    if (className && branch) {
      const [rows] = await db.query(
        `
        SELECT date, rollno, name, status
        FROM attendance
        WHERE class = ?
          AND branch = ?
        ORDER BY date DESC
        `,
        [className, branch]
      );
      return res.json(rows);
    }

    return res.status(400).json({
      error: "Missing query parameters"
    });
  } catch (err) {
    console.error("Attendance fetch error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
