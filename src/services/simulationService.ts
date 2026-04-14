import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { AppError } from "../appError";
import { simulationSchema } from "../schemas/simulationSchema";
import { START_COOLDOWN_MS, MAX_SECONDS, TEAM_POOL, TEAM_PAIRS } from "../constants/service.constants";
import type { FinishReason, Match, Simulation, TeamName } from "../types/simulationTypes";

type TimerId = ReturnType<typeof setTimeout>;

export function createSimulationService(
  now: () => number = Date.now,
  randomInt: (maxExclusive: number) => number = (max) => Math.floor(Math.random() * max)
) {
  const events = new EventEmitter();
  const byId = new Map<string, Simulation>();
  let currentId: string | null = null;
  let lastStartAt = 0;
  let tickTimer: TimerId | null = null;

  function requireSimulation(id: string): Simulation {
    const simulation = byId.get(id);
    if (!simulation) {
      throw new AppError("Simulation not found", 404, "SIMULATION_NOT_FOUND");
    }
    return simulation;
  }

  function getCurrent(): Simulation | null {
    if (!currentId) return null;
    return byId.get(currentId) ?? null;
  }

  function clearTick() {
    if (tickTimer) {
      clearTimeout(tickTimer);
      tickTimer = null;
    }
  }

  function applyGoal(matches: Match[], team: TeamName) {
    for (const match of matches) {
      if (match.homeTeam === team) {
        match.homeScore += 1;
        return;
      }
      if (match.awayTeam === team) {
        match.awayScore += 1;
        return;
      }
    }
  }

  function createZeroedMatches(): Match[] {
    return TEAM_PAIRS.map((pair) => ({
      homeTeam: pair.homeTeam,
      awayTeam: pair.awayTeam,
      homeScore: 0,
      awayScore: 0
    }));
  }

  function finishInternal(simulation: Simulation, reason: FinishReason) {
    clearTick();
    simulation.status = "FINISHED";
    simulation.finishReason = reason;
    simulation.finishedAt = now();
    byId.set(simulation.id, simulation);
    events.emit("simulation_finished", simulation);
  }

  function onTick(id: string) {
    const simulation = byId.get(id);
    if (!simulation || simulation.status !== "RUNNING") return;

    simulation.elapsedSeconds += 1;
    const scoringTeam = TEAM_POOL[randomInt(TEAM_POOL.length)];
    applyGoal(simulation.matches, scoringTeam);

    events.emit("goal_scored", {
      simulationId: simulation.id,
      runId: simulation.runId,
      second: simulation.elapsedSeconds,
      scoringTeam,
      scoreboard: simulation.matches.map((match) => ({ ...match }))
    });

    if (simulation.elapsedSeconds >= MAX_SECONDS) {
      finishInternal(simulation, "TIME_ELAPSED");
      return;
    }

    byId.set(simulation.id, simulation);
    scheduleTick(id);
  }

  function scheduleTick(id: string) {
    clearTick();
    tickTimer = setTimeout(() => onTick(id), 1000);
  }

  function start(nameInput: string): Simulation {
    const parsed = simulationSchema.safeParse({ name: nameInput });
    if (!parsed.success) {
      throw new AppError(
        "Invalid simulation name (8-30 chars, letters/digits/spaces only)",
        400,
        "VALIDATION_ERROR"
      );
    }

    const timeNow = now();
    if (timeNow - lastStartAt < START_COOLDOWN_MS) {
      throw new AppError("Simulation start cooldown active", 429, "COOLDOWN_ACTIVE", {
        retryAfterMs: START_COOLDOWN_MS - (timeNow - lastStartAt)
      });
    }

    const current = getCurrent();
    if (current && current.status === "RUNNING") {
      throw new AppError("A simulation is already running", 409, "SIMULATION_ALREADY_RUNNING");
    }

    const simulation: Simulation = {
      id: randomUUID(),
      name: parsed.data.name,
      status: "RUNNING",
      runId: 1,
      elapsedSeconds: 0,
      matches: createZeroedMatches(),
      startedAt: timeNow
    };

    byId.set(simulation.id, simulation);
    currentId = simulation.id;
    lastStartAt = timeNow;
    scheduleTick(simulation.id);
    events.emit("simulation_started", simulation);
    return simulation;
  }

  function finish(id: string): Simulation {
    const simulation = requireSimulation(id);
    if (simulation.status !== "RUNNING") {
      throw new AppError("Simulation is not running", 409, "SIMULATION_NOT_RUNNING");
    }
    finishInternal(simulation, "MANUAL");
    return simulation;
  }

  function restart(id: string): Simulation {
    const simulation = requireSimulation(id);
    if (simulation.status !== "FINISHED") {
      throw new AppError("Restart allowed only after finish", 409, "RESTART_NOT_ALLOWED");
    }

    const timeNow = now();
    if (timeNow - lastStartAt < START_COOLDOWN_MS) {
      throw new AppError("Simulation start cooldown active", 429, "COOLDOWN_ACTIVE", {
        retryAfterMs: START_COOLDOWN_MS - (timeNow - lastStartAt)
      });
    }

    simulation.status = "RUNNING";
    simulation.runId += 1;
    simulation.elapsedSeconds = 0;
    simulation.matches = createZeroedMatches();
    simulation.startedAt = timeNow;
    simulation.finishedAt = undefined;
    simulation.finishReason = undefined;
    byId.set(simulation.id, simulation);

    currentId = simulation.id;
    lastStartAt = timeNow;
    scheduleTick(simulation.id);
    events.emit("simulation_restarted", simulation);
    return simulation;
  }

  function getById(id: string): Simulation {
    return requireSimulation(id);
  }

  return {
    on: events.on.bind(events),
    start,
    finish,
    restart,
    getById
  };
}

export type SimulationService = ReturnType<typeof createSimulationService>;
