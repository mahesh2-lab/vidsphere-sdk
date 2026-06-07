import { describe, it, expect } from 'vitest';
import { VidSphereClient } from '../src/client';
import { AuthenticationError, ValidationError } from '../src/errors';

describe('VidSphereClient', () => {
  it('should initialize with provided config', () => {
    const client = new VidSphereClient({ apiKey: 'test-key', baseUrl: 'http://test' });
    expect(client.uploads).toBeDefined();
  });

  it('should fall back to environment variables', () => {
    process.env.VIDSPHERE_API_KEY = 'env-key';
    const client = new VidSphereClient();
    expect(client.uploads).toBeDefined();
    delete process.env.VIDSPHERE_API_KEY;
  });

  it('should throw AuthenticationError if API key is missing', () => {
    delete process.env.VIDSPHERE_API_KEY;
    expect(() => new VidSphereClient()).toThrow(AuthenticationError);
  });
});
