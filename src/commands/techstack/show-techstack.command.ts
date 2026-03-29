import { BaseCommand } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { checkbox } from '@inquirer/prompts';

export class ShowTechstackCommand<T extends string> extends BaseCommand<T[]> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[]
  ) {
    super(message);
  }

  async execute(): Promise<T[]> {
    const currentTechstack = {};
    console.log('Your current techstack: ', currentTechstack);
    return checkbox({
      message: this.message,
      choices: this.choices,
    });
  }
}
