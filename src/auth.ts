import { config } from './config.js';

export interface AuthenticatedUser {
  id: string;
}

/**
 * Development-only authentication. Production authentication must be supplied
 * by a trusted OAuth/JWT layer; an MCP client must never choose its own user ID.
 */
export function authenticateRequest(_headers: Record<string, string | string[] | undefined>): AuthenticatedUser | null {
  if (config.enableMockAuth && config.nodeEnv !== 'production') {
    return { id: config.mockUserId };
  }

  // Fail closed until a real OAuth/JWT verifier is configured.
  return null;
}
