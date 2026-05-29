import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./system-prompt";
import type { AIQuoteResponse, GenerateQuoteRequest } from "@/types/quote";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateQuote(
  input: GenerateQuoteRequest
): Promise<AIQuoteResponse> {
  const regionNote =
    input.region === "oslo" || input.region === "bergen"
      ? `\nRegion: ${input.region} (bruk +15–20% regiontillegg på timepriser)`
      : "";

  const rateNote = input.hourly_rate
    ? `\nSnekkeres foretrukne timepris: ${input.hourly_rate} NOK/time`
    : "";

  const userMessage = `Lag et tilbud for følgende prosjekt:

${input.description}${regionNote}${rateNote}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // Prompt caching: system prompt is large and static — cache it
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Strip accidental markdown fences before parsing
  const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/```$/m, "").trim();

  try {
    return JSON.parse(cleaned) as AIQuoteResponse;
  } catch {
    throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}
