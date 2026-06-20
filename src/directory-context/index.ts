import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  buildContextXml,
  collectEnvironmentContext,
} from "./context.ts";

export default function directoryContextExtension(pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event, ctx) => {
    const context = await collectEnvironmentContext(ctx.cwd);
    const contextXml = buildContextXml(context);
    const enhancedPrompt = `${event.systemPrompt}\n\n${contextXml}`;

    return {
      systemPrompt: enhancedPrompt,
    };
  });
}
