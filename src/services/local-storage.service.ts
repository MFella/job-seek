import { Encryption } from '@boringnode/encryption';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ConfigService } from '../config/config.service.ts';
import { chacha20poly1305 } from '@boringnode/encryption/drivers/chacha20_poly1305';
import { injectable } from 'tsyringe';

@injectable()
export class LocalStorageService {
  private readonly encryptionInstance;
  private readonly filePath: string;

  constructor() {
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
  async savePreferences(preferences: string): Promise<void> {
    try {
      const encryptedData = this.encryptionInstance.encrypt(preferences);
      await writeFile(this.filePath, encryptedData, 'utf-8');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }

  /**
   * Loads and decrypts preferences from a file.
   * @returns The decrypted preferences or null if the file doesn't exist.
   */
  async loadPreferences(): Promise<string | null> {
    try {
      const encryptedData = await readFile(this.filePath, 'utf-8');
      console.log('encData', encryptedData);
      return this.encryptionInstance.decrypt(encryptedData) as string;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }
      console.error('Failed to load preferences:', error);
      throw error;
    }
  }
}
