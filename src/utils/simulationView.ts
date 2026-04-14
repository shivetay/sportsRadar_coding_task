import type { Simulation } from "../types/simulationTypes";

export function simulationView(simulation: Simulation) {
  return {
    id: simulation.id,
    name: simulation.name,
    status: simulation.status,
    runId: simulation.runId,
    elapsedSeconds: simulation.elapsedSeconds,
    startedAt: simulation.startedAt,
    finishedAt: simulation.finishedAt,
    finishReason: simulation.finishReason,
    matches: simulation.matches
  };
}
