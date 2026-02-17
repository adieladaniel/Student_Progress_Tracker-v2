import express from "express";
import { db } from "../db.js";

const router = express.Router();

const TEACHER_PASSWORD = "ilb@2026";

router.post("/verify", async (req, res) => {
  const { rollno, className, branch, password } = req.body;

  // Teacher master password
  if (password === TEACHER_PASSWORD) {
    return res.json({ success: true, role: "teacher" });
  }

  // Student password check
  try {
    const [rows] = await db.query(
      `
      SELECT * FROM student_passwords
      WHERE rollno = ? AND class = ? AND branch = ? AND password = ?
      `,
      [rollno, className, branch, password]
    );

    if (rows.length > 0) {
      return res.json({ success: true, role: "student" });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid password"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
