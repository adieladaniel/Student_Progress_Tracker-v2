import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import attendanceRoutes from "./routes/attendance.js";
import studentRoutes from "./routes/students.js";
import curriculumRoutes from "./routes/curriculum.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Serve entire public folder
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/auth", authRoutes);

// Games route
app.use("/games", express.static(path.join(__dirname, "../public/games")));

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Backend running at http://localhost:${PORT}`);
// });

export default app;
