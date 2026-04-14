import express from "express";
import cors from "cors";
import { apiErrorMiddleware } from "./appError";
import { createSimulationRoutes } from "./routes/simulationRoutes";
import { createSimulationService } from "./services/simulationService";

export const simulationService = createSimulationService();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "10kb" }));

app.use(createSimulationRoutes(simulationService));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use(apiErrorMiddleware);

export default app;
