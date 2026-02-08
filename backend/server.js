import "dotenv/config";   // 👈 THIS LINE FIXES EVERYTHING

import express from "express";
import cors from "cors";

import attendanceRoutes from "./routes/attendance.js";
import studentRoutes from "./routes/students.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/attendance", attendanceRoutes);
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("ILB School Backend is running");
});

// DEBUG (keep once to verify)
// console.log("DB_USER =", process.env.DB_USER);
// console.log("DB_HOST =", process.env.DB_HOST);
// console.log("DB_NAME =", process.env.DB_NAME);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
