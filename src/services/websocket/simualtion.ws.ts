import { Server as HttpServer } from "node:http";
import WebSocket, { WebSocketServer } from "ws";
import type { SimulationService } from "../simulationService";

export function simulationWebSocket(server: HttpServer, service: SimulationService) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const broadcast = (event: string, payload: unknown) => {
    const msg = JSON.stringify({ event, payload });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    }
  };

  service.on("simulation_started", (payload) => broadcast("simulation_started", payload));
  service.on("goal_scored", (payload) => broadcast("goal_scored", payload));
  service.on("simulation_finished", (payload) => broadcast("simulation_finished", payload));
  service.on("simulation_restarted", (payload) => broadcast("simulation_restarted", payload));
}
