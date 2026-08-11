import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { input } from '@inquirer/prompts';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { CommandKey } from '../../questions/questions.ts';
import { LoggerService } from '../../logger/logger.service.ts';

export class AdjustTechstackCommand extends BaseCommand {
  private static readonly COMMAND_KEY: CommandKey = 'adjust-techstack';

  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<string>[],
    private readonly localStorageService: LocalStorageService,
    private readonly logger: LoggerService
  ) {
    super(message);
  }

  getKey(): CommandKey {
    return AdjustTechstackCommand.COMMAND_KEY;
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const result = await input(
      {
        message: this.message,
        validate: (value: string) => {
          return true;
        },
      },
      {
        signal: this.executionTerminationSignal,
      }
    );
    if (result.length === 0) {
      this.logger.info("Techstack won't be overridden.");
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
