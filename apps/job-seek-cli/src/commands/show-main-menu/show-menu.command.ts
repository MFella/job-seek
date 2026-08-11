import { select } from '@inquirer/prompts';
import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { CommandKey } from '../../questions/questions.ts';

export class ShowMainMenuCommand extends BaseCommand {
  private static readonly COMMAND_KEY: CommandKey = 'show-main-menu';

  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<CommandKey>[]
  ) {
    super(message);
  }

  getKey(): CommandKey {
    return ShowMainMenuCommand.COMMAND_KEY;
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const selectedCommandKey = await select(
      {
        choices: this.choices,
        message: this.message,
      },
      {
        signal: this.executionTerminationSignal,
      }
    );

    return [{ commandKey: selectedCommandKey }];
  }
}
