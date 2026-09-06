import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import householdsRouter from "./routes/households";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users";
import auditLogRouter from "./routes/auditLog";
import facilitiesRouter from "./routes/facilities";
import personnelRouter from "./routes/personnel";
import reportsRouter from "./routes/reports";

const app = express();
const port = process.env.PORT || 4000;

// exposedHeaders is required for fetch() in the browser to read Content-Disposition
// at all (browsers only expose a small "safe" header allowlist by default) -
// without it, downloadFile() in the frontend silently falls back to a generic name.
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
  exposedHeaders: ["Content-Disposition"],
}));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/households", householdsRouter);
app.use("/api/users", usersRouter);
app.use("/api/audit-log", auditLogRouter);
app.use("/api/facilities", facilitiesRouter);
app.use("/api/personnel", personnelRouter);
app.use("/api/reports", reportsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Village Health 360 API listening on port ${port}`);
});
