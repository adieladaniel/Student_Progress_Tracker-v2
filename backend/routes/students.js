import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { branch, className } = req.query;

  try {
    const [rows] = await db.query(
      "SELECT rollno, name, class, branch FROM students WHERE branch = ? AND class = ?",
      [branch, className]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
