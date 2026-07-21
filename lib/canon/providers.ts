import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  FixtureStoryIntelligenceProvider,
  LocalMentionProvider,
  type StoryAnalysisInput,
  type StoryAnalysisResult,
  type StoryIntelligenceProvider,
  storyAnalysisResultSchema,
  validatedResult,
} from "./story-pulse";

export class OpenAIStoryIntelligenceProvider implements StoryIntelligenceProvider {
  async analyze(input: StoryAnalysisInput): Promise<StoryAnalysisResult> {
    const modelName = process.env.OPENAI_STORY_MODEL ?? "gpt-4.1-mini";
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const generated = await generateObject({
      model: openai(modelName),
      schema: storyAnalysisResultSchema,
      system: "Extract only story facts directly supported by exact supplied quotes. Never rewrite prose, infer hidden state, or add entities absent from the changed blocks. Preserve requestId, revision, and manuscriptHash exactly.",
      prompt: JSON.stringify(input),
    });
    return validatedResult(input, generated.object);
  }
}

export function storyProvider(): StoryIntelligenceProvider {
  if (process.env.STORY_INTELLIGENCE_PROVIDER === "fixture" && process.env.NODE_ENV !== "production") {
    return new FixtureStoryIntelligenceProvider();
  }
  if (process.env.OPENAI_API_KEY) return new OpenAIStoryIntelligenceProvider();
  return new LocalMentionProvider();
}
