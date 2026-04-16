import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/userRoutes.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // 👈 pehle app banao

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));
// ✅ Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api", userRoutes);


// Server start
const PORT =7000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
