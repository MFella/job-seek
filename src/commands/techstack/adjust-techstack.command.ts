import { BaseCommand } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { input } from '@inquirer/prompts';
import { LocalStorageService } from '../../services/local-storage.service.ts';

export class AdjustTechstackCommand extends BaseCommand<string> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<string>[],
    private readonly localStorageService: LocalStorageService
  ) {
    super(message);
  }

  async execute(): Promise<string> {
    const preferences = JSON.parse(
      (await this.localStorageService.loadPreferences()) || '{}'
    );

    const result = await input({
      message: this.message,
      validate: (value: string) => {
        return true;
      },
    });
    if (result.length === 0) {
      console.log("Techstack won't be overridden.");
    }

    const parsedPreferences = JSON.stringify({
      ...preferences,
      ...this.parseTechstack(result),
    });

    this.localStorageService.savePreferences(parsedPreferences);
    return result;
  }

  private parseTechstack(techstack: string): Record<'techstack', string[]> {
    return { techstack: techstack.split(',').filter(Boolean) };
  }
}
