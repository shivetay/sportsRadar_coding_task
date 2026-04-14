import express from "express";
import request from "supertest";
import { apiErrorMiddleware } from "../src/appError";
import { createSimulationRoutes } from "../src/routes/simulationRoutes";
import type { SimulationService } from "../src/services/simulationService";
import { createSimulationService } from "../src/services/simulationService";

function testApp(service: SimulationService) {
  const app = express();
  app.use(express.json({ limit: "10kb" }));
  app.use(createSimulationRoutes(service));
  app.use(apiErrorMiddleware);
  return app;
}

describe("Simulation API", () => {
  it("validates simulation name", async () => {
    const service = createSimulationService(() => 1000);
    const res = await request(testApp(service)).post("/simulations/start").send({ name: "bad!" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("start and get by id works", async () => {
    const service = createSimulationService(() => 10000);
    const app = testApp(service);
    const start = await request(app).post("/simulations/start").send({ name: "Katar 2023" });
    expect(start.status).toBe(201);
    const get = await request(app).get(`/simulations/${start.body.id}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe(start.body.id);
  });
});
