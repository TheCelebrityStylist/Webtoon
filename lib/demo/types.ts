import { z } from "zod";

export const demoSceneSchema = z.object({
  id: z.string(), title: z.string(), chapter: z.string(), content: z.string(),
  goal: z.string(), characters: z.array(z.string()), location: z.string(), notes: z.array(z.string()), order: z.number(),
});
export const demoCharacterSchema = z.object({
  id:z.string(), name:z.string(), role:z.string(), goal:z.string(), fear:z.string(), secret:z.string(),
  emotion:z.string(), location:z.string(), facts:z.array(z.string()), beliefs:z.array(z.string()),
  relationships:z.array(z.string()), objects:z.array(z.string()), scenes:z.array(z.string()), history:z.array(z.string()),
});
export const demoIssueSchema = z.object({id:z.string(), title:z.string(), status:z.enum(["open","resolved","intentional","dismissed"]), reminder:z.boolean()});
export const demoFindingSchema = z.object({id:z.string(), category:z.enum(["Continuity","Character","Pacing","Dialogue"]), sceneId:z.string(), passage:z.string(), explanation:z.string(), importance:z.string(), status:z.enum(["open","resolved","intentional","dismissed","planned"])});
export const demoEventSchema = z.object({id:z.string(), title:z.string(), sceneId:z.string(), type:z.enum(["character","object","knowledge","reveal"]), order:z.number()});
export const demoStateSchema = z.object({
  version:z.literal(1), sessionId:z.string(), projectTitle:z.string(), currentSceneId:z.string(),
  scenes:z.array(demoSceneSchema), characters:z.array(demoCharacterSchema), issues:z.array(demoIssueSchema),
  findings:z.array(demoFindingSchema), events:z.array(demoEventSchema), keyOwner:z.enum(["Lena Ortiz","Tomas Reed"]),
  activity:z.array(z.string()), writingGoal:z.number(), reviewFilter:z.string(), timelineMode:z.enum(["story","manuscript"]),
});
export type DemoState=z.infer<typeof demoStateSchema>;
export type DemoScene=z.infer<typeof demoSceneSchema>;
