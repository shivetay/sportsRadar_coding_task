import z from "zod";

export const simulationSchema = z.object({
  name: z.string().min(8).max(30).regex(/^[A-Za-z0-9 ]+$/)
});

export type SimulationSchema = z.infer<typeof simulationSchema>;
