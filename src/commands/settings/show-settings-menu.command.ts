import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.ts';
import { select } from '@inquirer/prompts';
import { CommandKey } from '../../questions/questions.ts';

export class ShowSettingsMenuCommand extends BaseCommand {
  private static readonly COMMAND_KEY: CommandKey = "show-settings-menu";
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<CommandKey>[]
  ) {
    super(message);
  }

  getKey(): CommandKey {
    return ShowSettingsMenuCommand.COMMAND_KEY;
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const result = await select({
      message: this.message,
      choices: this.choices,
    });

    return [{ commandKey: result }];
  }
}
