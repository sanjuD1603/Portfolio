import type { Context } from "hono";
import { z } from "zod";
import {
  education,
  experience,
  profile,
  projects,
  searchContent,
  skills,
} from "./data";
import type { Env } from "./env";

const MODEL = "@cf/meta/llama-3.1-8b-instruct";

const CHAT_REQUEST_SCHEMA = z.object({
  message: z.string().min(1).max(2000),
});

/**
 * Local tool implementations shared with the MCP server (mcp.ts). Kept as
 * plain functions here (rather than round-tripping through the /mcp HTTP
 * endpoint) because they're pure, synchronous reads of the same in-memory
 * data this Worker already owns — the MCP endpoint exists so *external*
 * MCP clients can reach the same data, not because this route needs it.
 */
const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "getProfile",
      description:
        "Get the portfolio owner's name, role, intro and contact links",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getProjects",
      description:
        "List the portfolio owner's projects with summaries, stacks and links",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getSkills",
      description: "List the portfolio owner's skills grouped by category",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getExperience",
      description: "List the portfolio owner's work and research experience",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getEducation",
      description: "List the portfolio owner's education history",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "searchContent",
      description:
        "Case-insensitive search across projects, skills and experience for a keyword",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
];

function callTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case "getProfile":
      return profile;
    case "getProjects":
      return projects;
    case "getSkills":
      return skills;
    case "getExperience":
      return experience;
    case "getEducation":
      return education;
    case "searchContent":
      return searchContent(String(args.query ?? ""));
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

const SYSTEM_PROMPT =
  "You are the portfolio assistant for Mogili Dinesh Reddy, a full stack developer. " +
  "Answer visitor questions about his projects, skills, experience and education using the " +
  "provided tools to look up real data before answering — never invent project names, dates " +
  "or technologies. Keep answers concise (2-4 sentences). If asked something unrelated to the " +
  "portfolio, politely redirect to what you can help with.";

type AIMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
};

export async function handleChat(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => null);
  const parsed = CHAT_REQUEST_SCHEMA.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      400,
    );
  }

  const messages: AIMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: parsed.data.message },
  ];

  try {
    // First pass: let the model decide whether it needs a tool.
    const first = (await c.env.AI.run(MODEL, {
      messages,
      tools: TOOLS,
    })) as unknown as {
      response?: string;
      tool_calls?: { name: string; arguments: Record<string, unknown> }[];
    };

    if (!first.tool_calls || first.tool_calls.length === 0) {
      return c.json({
        reply: first.response ?? "I'm not sure how to answer that right now.",
      });
    }

    // Execute each requested tool call and feed the results back for a grounded answer.
    for (const call of first.tool_calls) {
      const result = callTool(call.name, call.arguments ?? {});
      messages.push({
        role: "tool",
        tool_call_id: call.name,
        content: JSON.stringify(result),
      });
    }

    const second = (await c.env.AI.run(MODEL, { messages })) as unknown as {
      response?: string;
    };
    return c.json({
      reply:
        second.response ??
        "I looked that up but couldn't form an answer — try rephrasing?",
    });
  } catch (err) {
    console.error("chat route failed", err);
    return c.json(
      { error: "The assistant is temporarily unavailable. Try again shortly." },
      502,
    );
  }
}
