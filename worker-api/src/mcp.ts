import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
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

/**
 * Real MCP server exposing the portfolio's projects/skills/experience/education
 * as tools, served at /mcp. Any MCP client (Claude Desktop, Claude Code, this
 * repo's own chat route) can connect to it, not just the portfolio's chat widget.
 */
export class PortfolioMCP extends McpAgent<
  Env,
  Record<string, never>,
  Record<string, never>
> {
  server = new McpServer({
    name: "dinesh-portfolio",
    version: "1.0.0",
  });

  async init() {
    this.server.registerTool(
      "getProfile",
      {
        description:
          "Get the portfolio owner's name, role, intro and contact links",
      },
      async () => ({
        content: [{ type: "text", text: JSON.stringify(profile) }],
      }),
    );

    this.server.registerTool(
      "getProjects",
      {
        description:
          "List the portfolio owner's projects with summaries, stacks and links",
      },
      async () => ({
        content: [{ type: "text", text: JSON.stringify(projects) }],
      }),
    );

    this.server.registerTool(
      "getSkills",
      { description: "List the portfolio owner's skills grouped by category" },
      async () => ({
        content: [{ type: "text", text: JSON.stringify(skills) }],
      }),
    );

    this.server.registerTool(
      "getExperience",
      {
        description: "List the portfolio owner's work and research experience",
      },
      async () => ({
        content: [{ type: "text", text: JSON.stringify(experience) }],
      }),
    );

    this.server.registerTool(
      "getEducation",
      { description: "List the portfolio owner's education history" },
      async () => ({
        content: [{ type: "text", text: JSON.stringify(education) }],
      }),
    );

    this.server.registerTool(
      "searchContent",
      {
        description:
          "Case-insensitive search across projects, skills and experience for a keyword",
        inputSchema: { query: z.string().describe("Keyword to search for") },
      },
      async ({ query }) => ({
        content: [{ type: "text", text: JSON.stringify(searchContent(query)) }],
      }),
    );
  }
}
