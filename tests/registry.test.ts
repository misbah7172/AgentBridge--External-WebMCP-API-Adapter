import { describe, expect, it } from "vitest";
import { agentBridgeTools } from "../src/registry/toolRegistry";

describe("AgentBridge tool registry", () => {
  it("contains the 17 approved fixed tools", () => {
    expect(agentBridgeTools).toHaveLength(17);
    expect(agentBridgeTools.map((tool) => tool.name)).not.toContain("checkout");
  });
  it("exposes the cart read/add boundary while leaving destructive checkout unavailable", () => {
    expect(agentBridgeTools.map((tool) => tool.name)).toEqual(expect.arrayContaining(["get_cart", "add_to_cart", "remove_from_cart"]));
  });
});
