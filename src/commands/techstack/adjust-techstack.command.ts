import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { input } from '@inquirer/prompts';
import { LocalStorageService } from '../../services/local-storage.service.ts';

export class AdjustTechstackCommand extends BaseCommand {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<string>[],
    private readonly localStorageService: LocalStorageService
  ) {
    super(message);
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const result = await input({
      message: this.message,
      validate: (value: string) => {
        return true;
      },
    });
    if (result.length === 0) {
      console.log("Techstack won't be overridden.");
    }

    this.localStorageService.savePreferences(
      'techstack',
      this.parseTechstack(result)
    );
    return [{ commandKey: 'show-techstack' }];
  }

  private parseTechstack(techstack: string): string[] {
    return techstack.split(',').filter(Boolean);
  }
}
