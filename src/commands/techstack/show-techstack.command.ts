import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { checkbox, select } from '@inquirer/prompts';
import { CommandKey } from '../../questions/questions.ts';
import { LocalStorageService } from '../../services/local-storage.service.ts';

export class ShowTechstackCommand extends BaseCommand {
  private static readonly COMMAND_KEY: CommandKey = 'show-techstack';

  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<CommandKey>[],
    private readonly localStorageService: LocalStorageService
  ) {
    super(message);
  }

  getKey(): CommandKey {
    return ShowTechstackCommand.COMMAND_KEY;
  }

  async execute(): Promise<NextCommandToExecute[]> {
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

    return [{ commandKey: result }];
  }
}
