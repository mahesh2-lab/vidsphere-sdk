# vidsphere-sdk

The official Node.js SDK for VidSphere. Securely and reliably upload videos to YouTube via your VidSphere account using an API key.

## Installation

Install the package via your preferred package manager:

```bash
npm install vidsphere-sdk
# or
pnpm add vidsphere-sdk
# or
yarn add vidsphere-sdk
```

## Quick Start

### 1. Initialization

Initialize the `VidSphereClient` with your API key. By default, it will attempt to read the `VIDSPHERE_API_KEY` from your environment variables.

```typescript
import { VidSphereClient } from 'vidsphere-sdk';

// Automatically picks up VIDSPHERE_API_KEY from process.env
const client = new VidSphereClient();

// Or pass it explicitly
const client = new VidSphereClient({
  apiKey: 'sk_test_123456789',
});
```

### 2. Uploading a Video

Use the `uploads` resource to upload a local video file. You can optionally track the progress of the upload.

```typescript
async function uploadVideo() {
  try {
    const uploadId = await client.uploads.upload('./path/to/video.mp4', (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });

    console.log('Video successfully uploaded! VidSphere ID:', uploadId);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

uploadVideo();
```

### 3. Checking Upload Status

Once uploaded, YouTube will process the video. You can check the processing status using the returned `uploadId`.

```typescript
async function checkStatus(uploadId: string) {
  const status = await client.uploads.getStatus(uploadId);
  console.log('Current status:', status);
}
```

## Configuration Options

The `VidSphereClient` accepts the following configuration object:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | `string` | `process.env.VIDSPHERE_API_KEY` | Your VidSphere API Key. |

## Supported File Types

The SDK validates files before uploading to save bandwidth. Supported formats include:
- `.mp4`
- `.mov`
- `.avi`
- `.mkv`
- `.webm`

## Error Handling

The SDK exposes custom error classes to help you handle failures gracefully:
- `AuthenticationError`: Thrown when an API key is missing or invalid.
- `ValidationError`: Thrown when configuration, file paths, or mime-types are invalid.

```typescript
import { AuthenticationError, ValidationError } from 'vidsphere-sdk/errors';

try {
  // ...
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error('Invalid API Key provided');
  } else if (err instanceof ValidationError) {
    console.error('Validation failed:', err.message);
  }
}
```

## License
MIT
