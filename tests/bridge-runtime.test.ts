import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

type Registered = { name: string; execute: (args: Record<string, unknown>) => Promise<unknown>; inputSchema: { required?: string[] } };
const loadBridge = async (cartItems: unknown[] = [], authenticated = false) => {
  const tools: Registered[] = [];
  const source = await readFile(new URL("../public/__agentbridge-webmcp/bridge-v2.js", import.meta.url), "utf8");
  const response = (body: unknown, status = 200) => ({ status, json: async () => body });
  vm.runInNewContext(source, {
    URL, Set, Object, Number, String, RegExp, console,
    location: { origin: "https://adapter.test" },
    document: { modelContext: { registerTool: (tool: Registered) => tools.push(tool) } },
    fetch: async (url: URL, init: RequestInit) => {
      if (url.pathname.endsWith("/api/auth/session") && init.method === "GET") return response({ success: true, data: { user: authenticated ? { id: "user-1" } : null } });
      if (url.pathname.endsWith("/api/cart") && init.method === "GET") return response({ success: true, data: { items: cartItems } });
      if (url.pathname.endsWith("/api/cart/items") && init.method === "POST") return response({ success: true, data: { items: [{ id: "item-1" }] } });
      return response({ success: true, data: {} });
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return tools;
};

describe("injected WebMCP bridge", () => {
  it("registers only public tools for an anonymous visitor", async () => {
    const tools = await loadBridge();
    expect(tools.map((tool) => tool.name)).toEqual(expect.arrayContaining(["search_products", "get_shipping_estimate"]));
    expect(tools.map((tool) => tool.name)).not.toEqual(expect.arrayContaining(["get_cart", "add_to_cart", "get_wishlist", "update_cart", "remove_from_cart", "apply_coupon", "checkout"]));
  });
  it("registers authenticated tools but not cart mutations for an empty cart", async () => {
    const tools = await loadBridge([], true);
    expect(tools.map((tool) => tool.name)).toEqual(expect.arrayContaining(["get_cart", "add_to_cart", "get_wishlist"]));
    expect(tools.map((tool) => tool.name)).not.toEqual(expect.arrayContaining(["update_cart", "remove_from_cart", "apply_coupon", "checkout"]));
  });
  it("registers populated-cart tools after authenticated cart discovery", async () => {
    const tools = await loadBridge([{ id: "item-1" }], true);
    expect(tools.map((tool) => tool.name)).toEqual(expect.arrayContaining(["update_cart", "remove_from_cart", "apply_coupon"]));
  });
  it("returns a structured validation failure without performing a mutation", async () => {
    const tools = await loadBridge([], true);
    const add = tools.find((tool) => tool.name === "add_to_cart")!;
    await expect(add.execute({ productId: "p-1", quantity: 0 })).resolves.toEqual({ success: false, error: { code: "VALIDATION_ERROR", message: "quantity must be an integer from 1 to 20.", retryable: false } });
  });
});
