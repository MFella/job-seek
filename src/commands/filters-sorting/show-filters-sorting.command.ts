import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { select } from '@inquirer/prompts';

export class ShowFiltersSortingCommand<
  T extends string,
> extends BaseCommand<T> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[]
  ) {
    super(message);
  }

  async execute(): Promise<NextCommandToExecute<T>[]> {
    const selectedCommandKey = await select({
      choices: this.choices,
      message: this.message,
    });

    return [{ commandKey: selectedCommandKey }];
  }
}
