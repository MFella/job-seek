import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { select } from '@inquirer/prompts';
import { CommandKey } from '../../questions/questions.ts';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { LoggerService } from '../../logger/logger.service.ts';

export class ShowTechstackCommand extends BaseCommand {
  private static readonly COMMAND_KEY: CommandKey = 'show-techstack';

  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<CommandKey>[],
    private readonly localStorageService: LocalStorageService,
    private readonly logger: LoggerService
  ) {
    super(message);
  }

  getKey(): CommandKey {
    return ShowTechstackCommand.COMMAND_KEY;
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const currentPreferences = await this.localStorageService.loadPreferences();
    if (!currentPreferences) {
      this.logger.info('You have no techstack set.');
    } else if ('techstack' in currentPreferences) {
      this.logger.info(
        `Your current techstack: ${currentPreferences.techstack.join(', ')}`
      );
    }

    const result = await select(
      {
        message: this.message,
        choices: this.choices,
      },
      {
        signal: this.executionTerminationSignal,
      }
    );

    return [{ commandKey: result }];
  }
}
