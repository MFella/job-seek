import { BaseCommand } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { checkbox, select } from '@inquirer/prompts';
import { getCommand } from '../../questions/questions.ts';
import { LocalStorageService } from '../../services/local-storage.service.ts';

export class ShowTechstackCommand<T extends string> extends BaseCommand<T> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[],
    private readonly localStorageService: LocalStorageService
  ) {
    super(message);
  }

  async execute(): Promise<T> {
    const currentPreferences = await this.localStorageService.loadPreferences();
    if (!currentPreferences) {
      console.log('You have no techstack set.');
    } else if ('techstack' in currentPreferences) {
      console.log(
        'Your current techstack:',
        currentPreferences.techstack.join(', ')
      );
    }

    const result = await select({
      message: this.message,
      choices: this.choices,
    });

    switch (result) {
      case 'adjust-techstack': {
        const adjustStackCommand = getCommand('adjust-techstack');
        await adjustStackCommand.execute();
        break;
      }
      case 'go-to-main-menu': {
        break;
      }
    }
    return result;
  }
}
