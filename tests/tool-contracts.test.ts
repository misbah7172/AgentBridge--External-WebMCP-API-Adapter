import { describe, expect, it } from "vitest";
import { agentBridgeTools } from "@/registry/toolRegistry";
import { addToCartTool, searchProductsTool } from "@/tools";

describe("AgentBridge tool contracts", () => {
  it("does not expose checkout without an isolated payment sandbox", () => {
    expect(agentBridgeTools.map((tool) => tool.name)).not.toContain("checkout");
  });
  it("publishes a structured schema for every registered tool", () => {
    for (const tool of agentBridgeTools) {
      expect(tool.name).toMatch(/^[a-z][a-z0-9_]+$/);
      expect(tool.description.length).toBeGreaterThan(15);
      expect(tool.inputSchema).toMatchObject({ type: "object" });
    }
  });
  it("rejects invalid cart input before an API request", async () => {
    await expect(addToCartTool.execute({ productId: "", quantity: 0 })).resolves.toEqual({ success: false, error: { code: "VALIDATION_ERROR", message: "Tool arguments are invalid.", retryable: false } });
  });
  it("rejects an empty search before an API request", async () => {
    await expect(searchProductsTool.execute({ query: "" })).resolves.toEqual({ success: false, error: { code: "VALIDATION_ERROR", message: "Tool arguments are invalid.", retryable: false } });
  });
});
