import { addToCartTool, addToWishlistTool, applyCouponTool, cancelOrderTool, filterProductsTool, getCartTool, getOrderDetailsTool, getOrdersTool, getProductDetailsTool, getRecommendationsTool, getShippingEstimateTool, getWishlistTool, removeFromCartTool, removeFromWishlistTool, searchProductsTool, sortProductsTool, updateCartTool } from "@/tools";

// Checkout creates a real order in the origin application. It is deliberately
// omitted until the origin provides an isolated payment sandbox.
export const agentBridgeTools = [searchProductsTool, getProductDetailsTool, filterProductsTool, sortProductsTool, getCartTool, addToCartTool, updateCartTool, removeFromCartTool, getWishlistTool, addToWishlistTool, removeFromWishlistTool, getOrdersTool, getOrderDetailsTool, cancelOrderTool, getRecommendationsTool, getShippingEstimateTool, applyCouponTool];
