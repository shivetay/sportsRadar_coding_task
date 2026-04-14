import { createSimulationService } from "../src/services/simulationService";

describe("createSimulationService", () => {
  let now = 10000;
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts and auto finishes after 9 ticks", () => {
    const service = createSimulationService(() => now, () => 0);

    const sim = service.start("Katar 2023");
    jest.advanceTimersByTime(9000);
    const out = service.getById(sim.id);

    expect(out.status).toBe("FINISHED");
    expect(out.elapsedSeconds).toBe(9);
    expect(out.finishReason).toBe("TIME_ELAPSED");
  });

  it("manual finish stops ticking", () => {
    const service = createSimulationService(() => now, () => 0);
    const sim = service.start("Katar 2023");
    jest.advanceTimersByTime(3000);
    service.finish(sim.id);
    const snapshot = service.getById(sim.id);
    const g1 = snapshot.matches.reduce((s, m) => s + m.homeScore + m.awayScore, 0);

    jest.advanceTimersByTime(3000);
    const after = service.getById(sim.id);
    const g2 = after.matches.reduce((s, m) => s + m.homeScore + m.awayScore, 0);
    expect(g2).toBe(g1);
  });

  it("enforces 5s cooldown", () => {
    const service = createSimulationService(() => now);
    service.start("Katar 2023");
    expect(() => service.start("Katar 2024")).toThrow("cooldown");
    now += 5000;
  });
});
