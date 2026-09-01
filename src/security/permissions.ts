export type ToolPermission = { authenticated: boolean; userConfirmation: boolean; destructive: boolean };
export const permissions = (authenticated = false, userConfirmation = false, destructive = false): ToolPermission => ({ authenticated, userConfirmation, destructive });
