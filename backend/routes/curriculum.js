import express from "express";
import { db } from "../db.js";

const router = express.Router();

/**
 * GET subjects for a class
 * /api/curriculum/subjects?className=PP1
 */
router.get("/subjects", async (req, res) => {
  const { className } = req.query;

  const [rows] = await db.query(
    `SELECT DISTINCT subject FROM curriculum_chapters WHERE class = ?`,
    [className]
  );

  res.json(rows);
});

/**
 * GET chapters + progress
 * /api/curriculum/chapters
 */
router.get("/chapters", async (req, res) => {
  const { rollno, className, subject } = req.query;

  const [rows] = await db.query(
    `
    SELECT 
      c.id,
      c.chapter_no,
      c.chapter_name,
      IF(p.completed IS NULL, false, p.completed) AS completed
    FROM curriculum_chapters c
    LEFT JOIN curriculum_progress p
      ON p.chapter_id = c.id AND p.rollno = ?
    WHERE c.class = ? AND c.subject = ?
    ORDER BY c.chapter_no
    `,
    [rollno, className, subject]
  );

  res.json(rows);
});

/**
 * POST save progress
 */
router.post("/progress", async (req, res) => {
  const { rollno, className, subject, chapterId, completed } = req.body;

  await db.query(
    `
    INSERT INTO curriculum_progress (rollno, class, subject, chapter_id, completed)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE completed = ?
    `,
    [rollno, className, subject, chapterId, completed, completed]
  );

  res.json({ success: true });
});

export default router;
