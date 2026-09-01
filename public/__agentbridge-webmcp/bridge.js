(() => {
  if (!document.modelContext?.registerTool) return;
  const string = { type: "string" }, number = { type: "number" };
  const fail = (code, message) => ({ success: false, error: { code, message } });
  const api = async (path, method, args = {}, authenticated = false) => {
    const url = new URL(`/api${path}`, location.origin);
    if (method === "GET") Object.entries(args).forEach(([key, value]) => value !== undefined && value !== "" && url.searchParams.set(key, String(value)));
    try {
      const response = await fetch(url, { method, credentials: "include", headers: method === "GET" ? undefined : { "content-type": "application/json" }, body: method === "GET" ? undefined : JSON.stringify(args) });
      if (authenticated && response.status === 401) return fail("AUTH_REQUIRED", "Please log in to AgentBridge before using this tool.");
      return await response.json();
    } catch { return fail("EXECUTION_FAILED", "AgentBridge request could not be completed."); }
  };
  const register = (name, title, description, properties, required, execute) => document.modelContext.registerTool({ name, title, description, inputSchema: { type: "object", properties, required }, execute });
  const definitions = [
    ["search_products", "Search Products", "Search the AgentBridge catalog.", { query: string, category: string, minPrice: number, maxPrice: number, brand: string, minRating: number, page: number, limit: number }, ["query"], a => api("/products/search", "GET", { ...a, q: a.query })],
    ["get_product_details", "Product Details", "Retrieve an AgentBridge product.", { productId: string }, ["productId"], a => api(`/products/${encodeURIComponent(a.productId)}`, "GET")],
    ["filter_products", "Filter Products", "Filter AgentBridge products.", { category: string, minPrice: number, maxPrice: number, brand: string, minRating: number, availability: string }, [], a => api("/products/filter", "GET", a)],
    ["sort_products", "Sort Products", "Sort AgentBridge product results.", { sort: { type: "string", enum: ["price_asc", "price_desc", "rating", "newest", "popularity"] }, query: string, category: string }, ["sort"], a => api("/products/search", "GET", { q: a.query, category: a.category, sort: a.sort })],
    ["get_cart", "Get Cart", "Retrieve the current cart.", {}, [], () => api("/cart", "GET", {}, true)],
    ["add_to_cart", "Add To Cart", "Add a product to the cart.", { productId: string, variantId: string, quantity: number }, ["productId"], a => api("/cart/items", "POST", { ...a, quantity: a.quantity ?? 1 }, true)],
    ["update_cart", "Update Cart", "Update a cart item quantity.", { itemId: string, quantity: number }, ["itemId", "quantity"], a => api(`/cart/items/${encodeURIComponent(a.itemId)}`, "PATCH", { quantity: a.quantity }, true)],
    ["remove_from_cart", "Remove From Cart", "Remove a cart item.", { itemId: string }, ["itemId"], a => api(`/cart/items/${encodeURIComponent(a.itemId)}`, "DELETE", {}, true)],
    ["get_wishlist", "Get Wishlist", "Retrieve the current wishlist.", {}, [], () => api("/wishlist", "GET", {}, true)],
    ["add_to_wishlist", "Add To Wishlist", "Save a product to the wishlist.", { productId: string }, ["productId"], a => api("/wishlist/items", "POST", a, true)],
    ["remove_from_wishlist", "Remove From Wishlist", "Remove a product from the wishlist.", { productId: string }, ["productId"], a => api(`/wishlist/items/${encodeURIComponent(a.productId)}`, "DELETE", {}, true)],
    ["get_order_history", "Order History", "Retrieve order history.", {}, [], () => api("/orders", "GET", {}, true)],
    ["get_order_details", "Order Details", "Retrieve an order.", { orderId: string }, ["orderId"], a => api(`/orders/${encodeURIComponent(a.orderId)}`, "GET", {}, true)],
    ["cancel_order", "Cancel Order", "Cancel an eligible order.", { orderId: string }, ["orderId"], a => api(`/orders/${encodeURIComponent(a.orderId)}/cancel`, "POST", {}, true)],
    ["get_product_recommendations", "Product Recommendations", "Get product recommendations.", { category: string, brand: string }, [], a => api("/products/recommendations", "GET", a)],
    ["get_shipping_estimate", "Shipping Estimate", "Estimate shipping.", { postalCode: string, country: string }, ["postalCode", "country"], a => api("/shipping/estimate", "GET", a)],
    ["apply_coupon", "Apply Coupon", "Apply a coupon.", { code: string }, ["code"], a => api("/cart/coupon", "POST", a, true)],
    ["checkout", "Checkout", "Place an order only after explicit confirmation.", { addressId: string, confirmed: { type: "boolean" } }, ["addressId"], a => a.confirmed ? api("/checkout", "POST", { addressId: a.addressId }, true) : ({ success: false, requiresConfirmation: true, action: "checkout", message: "Checkout will place an order. User confirmation is required." })]
  ];
  definitions.forEach(([name, title, description, properties, required, execute]) => register(name, title, description, properties, required, execute));
})();
