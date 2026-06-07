export interface VidSphereConfig {
  /**
   * Your VidSphere API key.
   * Falls back to the VIDSPHERE_API_KEY environment variable if not provided.
   */
  apiKey?: string;

  /**
   * The VidSphere base URL (e.g., https://vidsphere.app).
   * Falls back to the VIDSPHERE_BASE_URL environment variable if not provided.
   */
  baseUrl?: string;

  /**
   * Maximum number of automatic retries on transient network errors.
   * Defaults to 3.
   */
  maxRetries?: number;
}

export interface UploadOptions {
  /** Optional title for the video. */
  title?: string;
  /** Optional description for the video. */
  description?: string;
  /** Custom metadata to associate with this upload. */
  metadata?: Record<string, string>;
  /** Callback to track upload progress (0-100). */
  onProgress?: (percent: number) => void;
  /** AbortSignal to cancel the upload request. */
  signal?: AbortSignal;
}

export interface UploadResult {
  /** The VidSphere DB record ID for this upload. */
  id: string;
}

export interface UploadStatusResult {
  id: string;
  videoId?: string;
  title: string;
  databaseStatus: string;
  error?: string;
  errorMessage?: string;
  youtubeStatus?:
    | {
        uploadStatus?: string;
        privacyStatus?: string;
        rejectionReason?: string;
        processingStatus?: string;
      }
    | "not_found"
    | null;
}
