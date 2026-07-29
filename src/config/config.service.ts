try {
  process.loadEnvFile();
} catch (err: unknown) {
  console.warn('Env file not loaded', JSON.stringify(err));
  // .env is optional; env vars may already be set in the environment.
}

export class ConfigService {
  static readonly ENCRYPTION_KEY = 'my-super-secret-key-123456789012';
  static readonly DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

  static get GEMINI_API_KEY(): string {
    return process.env.GEMINI_API_KEY ?? '';
  }

  static get GEMINI_MODEL(): string {
    return process.env.GEMINI_MODEL || ConfigService.DEFAULT_GEMINI_MODEL;
  }
}
