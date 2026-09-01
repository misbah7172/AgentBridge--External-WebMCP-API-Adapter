import { agentBridgeTools } from "@/registry/toolRegistry";
declare global { interface Document { modelContext?: { registerTool: (tool: unknown) => void } } }
export function registerAgentBridgeTools() { if (!document.modelContext) return false; for (const tool of agentBridgeTools) document.modelContext.registerTool({ name: tool.name, title: tool.title, description: tool.description, inputSchema: tool.inputSchema, execute: tool.execute }); return true; }
registerAgentBridgeTools();
