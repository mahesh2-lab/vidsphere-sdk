# VidSphere SDK

A Node.js client to seamlessly upload videos to YouTube via your VidSphere account using an API key.

## Installation

```bash
npm install vidsphere
# or
pnpm add vidsphere
# or
yarn add vidsphere
```

## Quick Start

Set your API key in your environment variables:

```bash
export VIDSPHERE_API_KEY="your-api-key"
```

Use the client in your application:

```typescript
import { VidSphereClient } from 'vidsphere';

const client = new VidSphereClient();

async function main() {
  try {
    const upload = await client.uploads.create('./my-video.mp4', {
      title: 'My Video',
      description: 'An example video upload',
      metadata: {
        campaignId: '12345',
        source: 'dashboard'
      },
      onProgress: (percent) => {
        console.log(`Upload progress: ${percent}%`);
      }
    });

    console.log(`Upload complete! Video ID: ${upload.id}`);

    // Check status
    const status = await client.uploads.retrieve(upload.id);
    console.log('Current status:', status.databaseStatus);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

main();
```

## Configuration

You can also pass configuration directly to the client rather than using environment variables:

```typescript
const client = new VidSphereClient({
  apiKey: 'your-api-key',      // Defaults to process.env.VIDSPHERE_API_KEY
  baseUrl: 'https://vidsphere.app', // Defaults to process.env.VIDSPHERE_BASE_URL
  maxRetries: 3                // Defaults to 3
});
```

## Features

### Cancel Uploads

You can cancel uploads midway using an `AbortController`:

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await client.uploads.create('./large-video.mp4', {
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Upload was cancelled.');
  }
}
```

### Custom Metadata

You can pass custom metadata alongside your uploads to attach to the video object:

```typescript
await client.uploads.create('./video.mp4', {
  metadata: {
    userId: 'user_xyz',
    projectId: 'proj_123'
  }
});
```

## Error Handling

The SDK provides strongly-typed errors to help you handle specific failure cases programmatically:

```typescript
import { AuthenticationError, ValidationError, UploadError, NetworkError } from 'vidsphere';

try {
  await client.uploads.create('./video.mp4');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API Key');
  } else if (error instanceof ValidationError) {
    console.error('File not found or invalid format');
  } else if (error instanceof NetworkError) {
    console.error('Network failure after max retries');
  } else if (error instanceof UploadError) {
    console.error('Server rejected the upload');
  } else {
    console.error('Unknown error', error);
  }
}
```

## Requirements

- Node.js >= 18.0.0
