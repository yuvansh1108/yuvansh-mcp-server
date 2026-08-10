import { McpServer } from '@modelcontextprotocol/server/mcp.js';
import { z } from 'zod';
import { chattyPi } from './chattyPi.js';
import type { AuthenticatedUser } from './auth.js';

const pageInput = {
  cursor: z.string().optional().describe('Pagination cursor returned by the previous call.'),
  limit: z.number().int().min(1).max(100).default(20).describe('Maximum number of items to return.')
};

function requireUser(user: AuthenticatedUser | null): AuthenticatedUser {
  if (!user) throw new Error('Authentication required');
  return user;
}

export function createMcpServer(getUser: () => AuthenticatedUser | null): McpServer {
  const server = new McpServer(
    { name: 'Yuvansh MCP Server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    'get_my_profile',
    {
      title: 'Get my Chatty Pi profile',
      description: 'Read the authenticated Chatty Pi user profile.',
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      outputSchema: { profile: z.unknown() }
    },
    async () => {
      try {
        const user = requireUser(getUser());
        const profile = await chattyPi.getProfile(user.id);
        return { content: [{ type: 'text', text: JSON.stringify(profile) }], structuredContent: { profile } };
      } catch (error) {
        return { content: [{ type: 'text', text: safeError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_my_posts',
    {
      title: 'Get my Chatty Pi posts',
      description: 'Read posts belonging to the authenticated Chatty Pi user.',
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      inputSchema: pageInput
    },
    async ({ cursor, limit }) => {
      try {
        const user = requireUser(getUser());
        const result = await chattyPi.getPosts(user.id, cursor, limit);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: safeError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_my_notifications',
    {
      title: 'Get my Chatty Pi notifications',
      description: 'Read notifications belonging to the authenticated Chatty Pi user.',
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      inputSchema: pageInput
    },
    async ({ cursor, limit }) => {
      try {
        const user = requireUser(getUser());
        const result = await chattyPi.getNotifications(user.id, cursor, limit);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: safeError(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    'get_my_yuvabucks',
    {
      title: 'Get my YuvaBucks',
      description: 'Read the authenticated Chatty Pi user’s YuvaBucks balance and transactions.',
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
      inputSchema: pageInput
    },
    async ({ cursor, limit }) => {
      try {
        const user = requireUser(getUser());
        const result = await chattyPi.getYuvaBucks(user.id, cursor, limit);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      } catch (error) {
        return { content: [{ type: 'text', text: safeError(error) }], isError: true };
      }
    }
  );

  return server;
}

function safeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Request failed';
}
