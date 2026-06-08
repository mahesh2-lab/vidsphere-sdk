import { VidSphereConfig } from "./types";
import { AuthenticationError, ValidationError } from "./errors";
import { UploadsResource } from "./resources/uploads";

export class VidSphereClient {
  public uploads: UploadsResource;

  constructor(config: VidSphereConfig = {}) {
    const apiKey = config.apiKey ?? process.env.VIDSPHERE_API_KEY ?? "";
    const baseUrl = (
      config.baseUrl ??
      process.env.VIDSPHERE_BASE_URL ??
      "https://you-tube-creator-dashboard.vercel.app"
    ).replace(/\/$/, "");

    if (!apiKey) {
      throw new AuthenticationError(
        "[VidSphere] API key is missing.\n" +
          "Set VIDSPHERE_API_KEY in your environment, or pass { apiKey } to the constructor.",
      );
    }

    if (!baseUrl) {
      throw new ValidationError(
        "[VidSphere] Base URL is missing.\n" +
          "Set VIDSPHERE_BASE_URL in your environment, or pass { baseUrl } to the constructor.",
      );
    }

    this.uploads = new UploadsResource({ ...config, apiKey, baseUrl });
  }
}
