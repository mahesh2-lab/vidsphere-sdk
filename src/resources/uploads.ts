import fs from "fs";
import path from "path";
import { stat } from "fs/promises";
import { Transform } from "stream";
import {
  VidSphereConfig,
  UploadOptions,
  UploadResult,
  UploadStatusResult,
} from "../types";
import {
  AuthenticationError,
  NetworkError,
  UploadError,
  ValidationError,
} from "../errors";

const SUPPORTED_MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
};

export class UploadsResource {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;

  constructor(config: VidSphereConfig) {
    this.apiKey = config.apiKey ?? process.env.VIDSPHERE_API_KEY ?? "";
    this.baseUrl = (
      config.baseUrl ??
      process.env.VIDSPHERE_BASE_URL ??
      "https://vidsphere.app"
    ).replace(/\/$/, "");
    this.maxRetries = config.maxRetries ?? 3;

    if (!this.apiKey) {
      throw new AuthenticationError(
        "API key is missing. Set VIDSPHERE_API_KEY in your environment, or pass { apiKey } to the client.",
      );
    }
    if (!this.baseUrl) {
      throw new ValidationError("Base URL is missing.");
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    let attempt = 0;
    while (attempt <= this.maxRetries) {
      try {
        const response = await fetch(url, options);
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(
            `Authentication failed: HTTP ${response.status}`,
          );
        }
        if (response.status >= 500 && attempt < this.maxRetries) {
          throw new NetworkError(`Server error HTTP ${response.status}`);
        }
        if (!response.ok && response.status < 500) {
          let message = `HTTP ${response.status}`;
          try {
            const body = (await response.json()) as { error?: string };
            if (body.error) message = body.error;
          } catch {
            message = response.statusText || message;
          }
          throw new UploadError(`Request failed: ${message}`);
        }
        return response;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          throw err;
        }
        if (err instanceof AuthenticationError || err instanceof UploadError) {
          throw err;
        }

        attempt++;
        if (attempt > this.maxRetries) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          throw new NetworkError(
            `Network error after ${this.maxRetries} retries: ${errorMessage}`,
          );
        }
        const backoff = Math.min(1000 * 2 ** attempt, 10000);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
    throw new NetworkError("Max retries exceeded");
  }

  async create(
    filePath: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      throw new ValidationError(`File not found: ${resolved}`);
    }

    const fileStat = await stat(resolved);
    const fileSize = fileStat.size;

    if (fileSize === 0) {
      throw new ValidationError("File is empty.");
    }

    const ext = path.extname(resolved).toLowerCase();
    const mimeType = SUPPORTED_MIME_TYPES[ext];

    if (!mimeType) {
      throw new ValidationError(
        `Unsupported file type: "${ext}". Supported: ${Object.keys(SUPPORTED_MIME_TYPES).join(", ")}`,
      );
    }

    const filename = path.basename(resolved);

    let uploaded = 0;
    const progressStream = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        uploaded += chunk.length;
        const percent = Math.min(100, Math.round((uploaded / fileSize) * 100));
        options.onProgress?.(percent);
        callback(null, chunk);
      },
    });

    const fileStream = fs.createReadStream(resolved).pipe(progressStream);

    const headers: Record<string, string> = {
      "x-api-key": this.apiKey,
      "content-type": mimeType,
      "content-length": String(fileSize),
      "x-filename": encodeURIComponent(filename),
    };

    if (options.title)
      headers["x-video-title"] = encodeURIComponent(options.title);
    if (options.description)
      headers["x-video-description"] = encodeURIComponent(options.description);
    if (options.metadata) {
      headers["x-video-metadata"] = encodeURIComponent(
        JSON.stringify(options.metadata),
      );
    }

    const res = await this.fetchWithRetry(
      `${this.baseUrl}/api/youtube/uploadkit`,
      {
        method: "POST",
        headers,
        body: fileStream as unknown as BodyInit,
        signal: options.signal,
        duplex: "half",
      } as unknown as RequestInit,
    );

    const data = (await res.json()) as Partial<UploadResult>;

    if (!data.id) {
      throw new UploadError(
        "Server returned an invalid response (missing id).",
      );
    }

    return { id: data.id };
  }

  async retrieve(uploadId: string): Promise<UploadStatusResult> {
    const res = await this.fetchWithRetry(
      `${this.baseUrl}/api/youtube/uploadkit/${uploadId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
        },
      },
    );

    return (await res.json()) as UploadStatusResult;
  }
}
