import { Encryption } from '@boringnode/encryption';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ConfigService } from '../config/config.service.ts';
import { chacha20poly1305 } from '@boringnode/encryption/drivers/chacha20_poly1305';
import { inject, injectable } from 'tsyringe';
import { SeekSource } from '../resolvers/seek-job.ts';
import { LoggerService } from '../logger/logger.service.ts';

type Preferences = {
  seekingSources: SeekSource[];
  techstack: string[];
  // Path for JSON file to create tailored CV's from
  masterCvPath: string;
};

@injectable()
export class LocalStorageService {
  private readonly encryptionInstance;
  private readonly filePath: string;

  constructor(@inject(LoggerService) private readonly logger: LoggerService) {
    this.encryptionInstance = new Encryption(
      chacha20poly1305({
        id: 'app',
        keys: [ConfigService.ENCRYPTION_KEY],
      })
    );
    // Store in the root directory as preferences.enc
    this.filePath = join(process.cwd(), 'preferences.enc');
  }

  /**
   * Encrypts and saves preferences to a file.
   * @param preferences The data to save.
   */
  async savePreferences(
    preferenceKey: keyof Preferences,
    preferences: Preferences[typeof preferenceKey]
  ): Promise<void> {
    try {
      const existingPreferences = await this.loadPreferences();
      const preferencesToSave = {
        ...(existingPreferences ? existingPreferences : {}),
        [preferenceKey]: preferences,
      };
      const encryptedData = this.encryptionInstance.encrypt(
        JSON.stringify(preferencesToSave)
      );

      await writeFile(this.filePath, encryptedData, 'utf-8');
    } catch (error) {
      this.logger.error('Failed to save preferences', error);
      throw error;
    }
  }

  /**
   * Loads and decrypts preferences from a file.
   * @returns The decrypted preferences or null if the file doesn't exist.
   */
  async loadPreferences(): Promise<Preferences>;
  async loadPreferences<T extends keyof Preferences>(
    preferenceKey: T
  ): Promise<Preferences[T]>;
  async loadPreferences<T extends keyof Preferences>(
    preferenceKey?: T
  ): Promise<Preferences | Preferences[T] | null> {
    try {
      const encryptedData = await readFile(this.filePath, 'utf-8');
      const decryptedData =
        this.encryptionInstance.decrypt<string>(encryptedData);
      if (!decryptedData) {
        return null;
      }
      const parsedDecryptedData = JSON.parse(decryptedData) as Preferences;

      if (!preferenceKey) {
        return parsedDecryptedData;
      }

      return parsedDecryptedData[preferenceKey];
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      this.logger.error('Failed to load preferences', error);
      throw error;
    }
  }
}
