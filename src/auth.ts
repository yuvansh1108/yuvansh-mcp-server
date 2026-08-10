import { config } from './config.js';

export interface AuthenticatedUser {
  id: string;
}

export function authenticateRequest(headers: Record<string, string | string[] | undefined>): AuthenticatedUser | null {
  if (config.enableMockAuth && config.nodeEnv !== 'production') {
    return { id: config.mockUserId };
  }

  if (!config.mcpAuthToken) return null;
  const authorization = headers.authorization;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!value?.startsWith('Bearer ')) return null;

  const token = value.slice('Bearer '.length).trim();
  if (token !== config.mcpAuthToken) return null;

  const userId = headers['x-chatty-pi-user-id'];
  const id = Array.isArray(userId) ? userId[0] : userId;
  return id ? { id } : null;
}
