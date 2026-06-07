import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadsResource } from '../src/resources/uploads';
import { ValidationError, UploadError, AuthenticationError } from '../src/errors';
import fs from 'fs';

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    createReadStream: vi.fn(),
  }
}));

vi.mock('fs/promises', () => ({
  stat: vi.fn(),
}));

describe('UploadsResource', () => {
  const config = { apiKey: 'test-key', baseUrl: 'http://test' };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should throw ValidationError if file does not exist', async () => {
    (fs.existsSync as any).mockReturnValue(false);
    const uploads = new UploadsResource(config);

    await expect(uploads.create('./nonexistent.mp4')).rejects.toThrow(ValidationError);
  });

  it('should initialize correctly', () => {
    const uploads = new UploadsResource(config);
    expect(uploads).toBeDefined();
  });
});
