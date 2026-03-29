import { BaseCommand } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { select } from '@inquirer/prompts';

export class SeekJobCommand<T extends string> extends BaseCommand<T> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[]
  ) {
    super(message);
  }

  async execute(): Promise<T> {
    // TODO: load job seek settings
    const jobSeekSettingsStringified = Object.entries({})
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // TODO: Use logger instead of console.log
    console.log('Seeking jobs with config: ', jobSeekSettingsStringified);

    // TODO: implement job seeking logic

    return await select({
      choices: this.choices,
      message: this.message,
    });
  }
}
