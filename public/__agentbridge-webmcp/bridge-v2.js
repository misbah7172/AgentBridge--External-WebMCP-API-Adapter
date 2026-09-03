(() => {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const string = { type: "string" }, number = { type: "number" };
  const registered = new Set();
  const fail = (code, message, retryable = false) => ({ success: false, error: { code, message, retryable } });
  const validText = (value) => typeof value === "string" && value.trim().length > 0;
  const validate = (name, args = {}) => {
    const required = { search_products: ["query"], get_product_details: ["productId"], sort_products: ["sort"], add_to_cart: ["productId"], update_cart: ["itemId", "quantity"], remove_from_cart: ["itemId"], add_to_wishlist: ["productId"], remove_from_wishlist: ["productId"], get_order_details: ["orderId"], cancel_order: ["orderId"], get_shipping_estimate: ["postalCode", "country"], apply_coupon: ["code"] }[name] ?? [];
    if (required.some((key) => key === "quantity" ? !Number.isInteger(args[key]) : !validText(args[key]))) return fail("VALIDATION_ERROR", "Required tool arguments are missing or invalid.");
    for (const key of ["minPrice", "maxPrice", "minRating", "page", "limit", "quantity"]) if (args[key] !== undefined && (typeof args[key] !== "number" || !Number.isFinite(args[key]))) return fail("VALIDATION_ERROR", `${key} must be a number.`);
    if (args.quantity !== undefined && (!Number.isInteger(args.quantity) || args.quantity < 1 || args.quantity > 20)) return fail("VALIDATION_ERROR", "quantity must be an integer from 1 to 20.");
    if ((args.minPrice !== undefined && args.minPrice < 0) || (args.maxPrice !== undefined && args.maxPrice < 0) || (args.minPrice !== undefined && args.maxPrice !== undefined && args.minPrice > args.maxPrice)) return fail("VALIDATION_ERROR", "Price bounds are invalid.");
    if (args.limit !== undefined && (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 50)) return fail("VALIDATION_ERROR", "limit must be an integer from 1 to 50.");
    if (args.country !== undefined && !/^[A-Za-z]{2}$/.test(args.country)) return fail("VALIDATION_ERROR", "country must be a two-letter country code.");
    return null;
  };
  const api = async (path, method, args = {}, authenticated = false) => {
    const url = new URL(`/api${path}`, location.origin);
    if (method === "GET") Object.entries(args).forEach(([key, value]) => value !== undefined && value !== "" && url.searchParams.set(key, String(value)));
    try {
      const response = await fetch(url, { method, credentials: "include", headers: method === "GET" ? undefined : { "content-type": "application/json" }, body: method === "GET" ? undefined : JSON.stringify(args) });
      if (authenticated && response.status === 401) return fail("AUTH_REQUIRED", "Please log in to AgentBridge before using this tool.");
      const result = await response.json();
      if (!result || typeof result !== "object") return fail("MALFORMED_RESPONSE", "AgentBridge returned an unreadable response.", true);
      if (result.success === false && result.error) result.error.retryable ??= response.status >= 500;
      return result;
    } catch { return fail("API_UNAVAILABLE", "AgentBridge is temporarily unavailable.", true); }
  };
  const register = (definition) => {
    if (registered.has(definition.name)) return;
    registered.add(definition.name);
    context.registerTool({ name: definition.name, title: definition.title, description: definition.description, inputSchema: { type: "object", properties: definition.properties, required: definition.required }, execute: async (args) => {
      const invalid = validate(definition.name, args);
      if (invalid) return invalid;
      const result = await definition.execute(args ?? {});
      if (definition.name === "add_to_cart" && result.success) enableCartTools();
      return result;
    }});
  };
  const make = ([name, title, description, properties, required, execute]) => ({ name, title, description, properties, required, execute });
  const tools = [
    ["search_products", "Search Products", "Search catalog products using text and optional filters.", { query: string, category: string, minPrice: number, maxPrice: number, brand: string, minRating: number, page: number, limit: number }, ["query"], a => api("/products/search", "GET", { ...a, q: a.query })],
    ["get_product_details", "Product Details", "Retrieve the details of a product by its product ID.", { productId: string }, ["productId"], a => api(`/products/${encodeURIComponent(a.productId)}`, "GET")],
    ["filter_products", "Filter Products", "Filter catalog products by category, price, brand, rating, or availability.", { category: string, minPrice: number, maxPrice: number, brand: string, minRating: number, availability: { type: "string", enum: ["in_stock", "all"] } }, [], a => api("/products/filter", "GET", a)],
    ["sort_products", "Sort Products", "Sort a catalog search result by price, rating, newest, or popularity.", { sort: { type: "string", enum: ["price_asc", "price_desc", "rating", "newest", "popularity"] }, query: string, category: string }, ["sort"], a => api("/products/search", "GET", { q: a.query, category: a.category, sort: a.sort })],
    ["get_cart", "Get Cart", "Retrieve the authenticated user's cart, including item IDs and totals.", {}, [], () => api("/cart", "GET", {}, true)],
    ["add_to_cart", "Add To Cart", "Add a product ID and optional variant to the authenticated user's cart.", { productId: string, variantId: string, quantity: number }, ["productId"], a => api("/cart/items", "POST", { ...a, quantity: a.quantity ?? 1 }, true)],
    ["get_wishlist", "Get Wishlist", "Retrieve the authenticated user's wishlist.", {}, [], () => api("/wishlist", "GET", {}, true)],
    ["add_to_wishlist", "Add To Wishlist", "Save a product ID to the authenticated user's wishlist.", { productId: string }, ["productId"], a => api("/wishlist/items", "POST", a, true)],
    ["remove_from_wishlist", "Remove From Wishlist", "Remove a product ID from the authenticated user's wishlist.", { productId: string }, ["productId"], a => api(`/wishlist/items/${encodeURIComponent(a.productId)}`, "DELETE", {}, true)],
    ["get_order_history", "Order History", "Retrieve the authenticated user's order history.", {}, [], () => api("/orders", "GET", {}, true)],
    ["get_order_details", "Order Details", "Retrieve an order by the authenticated user's order ID.", { orderId: string }, ["orderId"], a => api(`/orders/${encodeURIComponent(a.orderId)}`, "GET", {}, true)],
    ["cancel_order", "Cancel Order", "Cancel an eligible order by order ID. This changes order state.", { orderId: string }, ["orderId"], a => api(`/orders/${encodeURIComponent(a.orderId)}/cancel`, "POST", {}, true)],
    ["get_product_recommendations", "Product Recommendations", "Get catalog recommendations optionally narrowed by category or brand.", { category: string, brand: string }, [], a => api("/products/recommendations", "GET", a)],
    ["get_shipping_estimate", "Shipping Estimate", "Estimate shipping for a postal code and two-letter country code.", { postalCode: string, country: string }, ["postalCode", "country"], a => api("/shipping/estimate", "GET", a)],
  ].map(make);
  const cartTools = [
    ["update_cart", "Update Cart", "Set the quantity for an existing cart item ID.", { itemId: string, quantity: number }, ["itemId", "quantity"], a => api(`/cart/items/${encodeURIComponent(a.itemId)}`, "PATCH", { quantity: a.quantity }, true)],
    ["remove_from_cart", "Remove From Cart", "Remove an existing cart item ID from the authenticated user's cart.", { itemId: string }, ["itemId"], a => api(`/cart/items/${encodeURIComponent(a.itemId)}`, "DELETE", {}, true)],
    ["apply_coupon", "Apply Coupon", "Apply a coupon code to a populated authenticated cart.", { code: string }, ["code"], a => api("/cart/coupon", "POST", a, true)],
  ].map(make);
  const enableCartTools = () => cartTools.forEach(register);
  tools.forEach(register);
  api("/cart", "GET", {}, true).then((cart) => { if (cart.success && cart.data?.items?.length) enableCartTools(); });
})();
