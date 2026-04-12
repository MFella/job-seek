import { BaseCommand } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.ts';
import { select } from '@inquirer/prompts';
import { getCommand } from '../../questions/questions.ts';

export class ShowSettingsMenuCommand<T extends string> extends BaseCommand<T> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[]
  ) {
    super(message);
  }

  async execute(): Promise<T> {
    const result = await select({
      message: this.message,
      choices: this.choices,
    });

    switch (result) {
      case 'adjust-seeking-sources': {
        const adjustSeekingSourcesCommand = getCommand(
          'adjust-seeking-sources'
        );
        await adjustSeekingSourcesCommand.execute();
        break;
      }
      case 'go-to-main-menu': {
        break;
      }
    }
    return result;
  }
}
