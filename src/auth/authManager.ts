export const authRequiredResult = () => ({ success: false, error: { code: "AUTH_REQUIRED", message: "Please log in to AgentBridge before using this tool." } });
export function isAuthenticationFailure(response: Response) { return response.status === 401 || response.status === 403; }
