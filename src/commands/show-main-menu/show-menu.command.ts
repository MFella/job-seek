import { select } from '@inquirer/prompts';
import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { CommandKey } from '../../questions/questions.ts';

export class ShowMainMenuCommand extends BaseCommand {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<CommandKey>[]
  ) {
    super(message);
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const selectedCommandKey = await select({
      choices: this.choices,
      message: this.message,
    });

    return [{ commandKey: selectedCommandKey }];
  }
}
