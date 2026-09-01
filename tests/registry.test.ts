import { describe, expect, it } from "vitest";
import { agentBridgeTools } from "../src/registry/toolRegistry";
describe("AgentBridge tool registry", () => { it("contains the approved 18 fixed tools", () => { expect(agentBridgeTools).toHaveLength(18); expect(agentBridgeTools.map((tool) => tool.name)).toContain("checkout"); }); it("requires confirmation before checkout", async () => { const checkout = agentBridgeTools.find((tool) => tool.name === "checkout")!; await expect(checkout.execute({ addressId: "address-1" })).resolves.toMatchObject({ requiresConfirmation: true }); }); });
