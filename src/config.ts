import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  mcpPath: process.env.MCP_PATH ?? '/mcp',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  chattyPiApiBaseUrl: process.env.CHATTY_PI_API_BASE_URL?.replace(/\/$/, '') ?? '',
  chattyPiApiKey: process.env.CHATTY_PI_API_KEY ?? '',
  mcpAuthToken: process.env.MCP_AUTH_TOKEN ?? '',
  enableMockAuth: process.env.ENABLE_MOCK_AUTH === 'true',
  mockUserId: process.env.MOCK_USER_ID ?? '1'
};

export function requireProductionSecrets(): void {
  if (config.nodeEnv === 'production') {
    required('MCP_AUTH_TOKEN');
    required('CHATTY_PI_API_BASE_URL');
    required('CHATTY_PI_API_KEY');
  }
}
