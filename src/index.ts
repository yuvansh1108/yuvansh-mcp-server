import express from 'express';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { createMcpServer } from './mcp.js';
import { authenticateRequest } from './auth.js';
import { config, requireProductionSecrets } from './config.js';

requireProductionSecrets();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'yuvansh-mcp-server', version: '1.0.0' });
});

app.all(config.mcpPath, async (req, res) => {
  const user = authenticateRequest(req.headers as Record<string, string | string[] | undefined>);

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const server = createMcpServer(() => user);
    const transport = new NodeStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('MCP request failed:', error instanceof Error ? error.message : 'unknown error');
    if (!res.headersSent) res.status(500).json({ error: 'MCP request failed' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(config.port, () => {
  console.log(`Yuvansh MCP Server listening on port ${config.port}`);
  console.log(`MCP endpoint: ${config.mcpPath}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
