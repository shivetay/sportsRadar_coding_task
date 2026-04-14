export type TeamName =
  | "Germany"
  | "Poland"
  | "Brazil"
  | "Mexico"
  | "Argentina"
  | "Uruguay";

export interface Match {
  homeTeam: TeamName;
  awayTeam: TeamName;
  homeScore: number;
  awayScore: number;
}

export type SimulationStatus = "RUNNING" | "FINISHED";
export type FinishReason = "MANUAL" | "TIME_ELAPSED";

export interface Simulation {
  id: string;
  name: string;
  status: SimulationStatus;
  runId: number;
  elapsedSeconds: number;
  matches: Match[];
  startedAt: number;
  finishedAt?: number;
  finishReason?: FinishReason;
}
