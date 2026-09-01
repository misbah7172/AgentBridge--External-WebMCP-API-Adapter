import { agentBridgeConfig } from "@/config/agentbridge";
export function assertAgentBridgeUrl(url: URL) { if (url.origin !== agentBridgeConfig.origin || !url.pathname.startsWith("/api/")) throw new Error("ORIGIN_NOT_ALLOWED"); }
export function logToolEvent(toolName: string, executionMode: "api" | "browser", startedAt: number, success: boolean, errorCode?: string) { console.log(JSON.stringify({ timestamp: new Date().toISOString(), toolName, executionMode, success, latency: Date.now() - startedAt, errorCode })); }
