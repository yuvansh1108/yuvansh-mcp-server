import { config } from './config.js';

export interface Page<T> {
  items: T[];
  nextCursor?: string;
}

export interface ChattyPiService {
  getProfile(userId: string): Promise<unknown>;
  getPosts(userId: string, cursor?: string, limit?: number): Promise<Page<unknown>>;
  getNotifications(userId: string, cursor?: string, limit?: number): Promise<Page<unknown>>;
  getYuvaBucks(userId: string, cursor?: string, limit?: number): Promise<unknown>;
}

class HttpChattyPiService implements ChattyPiService {
  private async request(path: string, userId: string, params?: Record<string, string | number | undefined>): Promise<any> {
    if (!config.chattyPiApiBaseUrl || !config.chattyPiApiKey) {
      throw new Error('Chatty Pi API is not configured');
    }

    const url = new URL(path, `${config.chattyPiApiBaseUrl}/`);
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${config.chattyPiApiKey}`,
        'X-Chatty-Pi-User-Id': userId
      },
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      throw new Error(`Chatty Pi API request failed with HTTP ${response.status}`);
    }

    return response.json();
  }

  async getProfile(userId: string): Promise<unknown> {
    return this.request('/me', userId);
  }

  async getPosts(userId: string, cursor?: string, limit = 20): Promise<Page<unknown>> {
    return this.request('/posts', userId, { cursor, limit });
  }

  async getNotifications(userId: string, cursor?: string, limit = 20): Promise<Page<unknown>> {
    return this.request('/notifications', userId, { cursor, limit });
  }

  async getYuvaBucks(userId: string, cursor?: string, limit = 20): Promise<unknown> {
    return this.request('/yuvabucks', userId, { cursor, limit });
  }
}

class MockChattyPiService implements ChattyPiService {
  async getProfile(userId: string) {
    return { id: userId, username: `demo_${userId}`, displayName: 'Chatty Pi Demo User' };
  }

  async getPosts(_userId: string, _cursor?: string, limit = 20): Promise<Page<unknown>> {
    return { items: [], nextCursor: undefined, requestedLimit: limit } as Page<unknown>;
  }

  async getNotifications(_userId: string, _cursor?: string, _limit = 20): Promise<Page<unknown>> {
    return { items: [], nextCursor: undefined };
  }

  async getYuvaBucks(userId: string): Promise<unknown> {
    return { userId, balance: 100, transactions: [] };
  }
}

export const chattyPi: ChattyPiService =
  config.enableMockAuth && config.nodeEnv !== 'production'
    ? new MockChattyPiService()
    : new HttpChattyPiService();
