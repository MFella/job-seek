import { checkbox, select } from '@inquirer/prompts';
import { BaseCommand } from '../base-command.ts';
import { SelectChoiceItem } from '../../common/inquirer.js';
import { LocalStorageService } from '../../services/local-storage.service.ts';

export class AdjustSeekingSourcesCommand<
  T extends string,
> extends BaseCommand<T> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[],
    private readonly localStorageService: LocalStorageService
  ) {
    super(message);
  }

  async execute(): Promise<T | T[]> {
    const currentPreferences = JSON.parse(
      (await this.localStorageService.loadPreferences()) || '{}'
    );

    const currentSeekingSources = currentPreferences.seekingSources;
    const choices = this.choices.map((choice) => ({
      ...choice,
      checked: currentSeekingSources?.includes(choice.value),
    }));

    const result = await checkbox({
      message: this.message,
      choices,
    });

    this.localStorageService.savePreferences(
      JSON.stringify({ ...currentPreferences, seekingSources: result })
    );
    return result;
  }
}
