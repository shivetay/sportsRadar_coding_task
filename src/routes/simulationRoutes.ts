import { Router } from "express";
import type { SimulationService } from "../services/simulationService";
import {
  finishSimulation,
  getSimulationById,
  restartSimulation,
  startSimulation
} from "../controllers/simulationController";

export function createSimulationRoutes(service: SimulationService): Router {
  const router = Router();
  router.post("/simulations/start", startSimulation(service));
  router.post("/simulations/:id/finish", finishSimulation(service));
  router.post("/simulations/:id/restart", restartSimulation(service));
  router.get("/simulations/:id", getSimulationById(service));
  return router;
}
