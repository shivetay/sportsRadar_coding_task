import { Request, Response, NextFunction } from "express";
import type { SimulationService } from "../services/simulationService";
import { simulationView } from "../utils/simulationView";

export function startSimulation(service: SimulationService) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const simulation = service.start(String(req.body?.name ?? ""));
      res.status(201).json(simulationView(simulation));
    } catch (e) {
      next(e);
    }
  };
}

export function finishSimulation(service: SimulationService) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const simulation = service.finish(req.params.id);
      res.status(200).json(simulationView(simulation));
    } catch (e) {
      next(e);
    }
  };
}

export function restartSimulation(service: SimulationService) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const simulation = service.restart(req.params.id);
      res.status(200).json(simulationView(simulation));
    } catch (e) {
      next(e);
    }
  };
}

export function getSimulationById(service: SimulationService) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const simulation = service.getById(req.params.id);
      res.status(200).json(simulationView(simulation));
    } catch (e) {
      next(e);
    }
  };
}
