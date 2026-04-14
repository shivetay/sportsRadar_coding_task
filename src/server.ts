import "dotenv/config";
import { createServer } from "node:http";
import app, { simulationService } from "./app";
import { simulationWebSocket } from "./services/websocket/simualtion.ws";

const PORT = Number(process.env.PORT ?? 3823);
const server = createServer(app);

simulationWebSocket(server, simulationService);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Simulation API listening on port ${PORT}`);
});
