export type BrowserAction = { name: string; selector: string };
const approvedActions: Record<string, BrowserAction> = {};
export function getBrowserAction(name: string) { return approvedActions[name] ?? null; }
