import { checkbox } from '@inquirer/prompts';
import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import { SelectChoiceItem } from '../../common/inquirer.js';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { SeekSource, SeekSources } from '../../services/seek-job.service.ts';

const SUPPORTED_MANY_SEEKING_SOURCES: SeekSources[] = ['just-join-it'];

export class AdjustSeekingSourcesCommand extends BaseCommand {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<string>[],
    private readonly localStorageService: LocalStorageService
  ) {
    super(message);
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const currentSeekingSources =
      (await this.localStorageService.loadPreferences('seekingSources')) || [];
    console.log('cc', currentSeekingSources);
    const choices = this.choices.map((choice) => ({
      ...choice,
      checked: currentSeekingSources
        .map(({ name }) => name)
        ?.includes(choice.value as SeekSources),
    }));

    const result = await checkbox({
      message: this.message,
      choices,
    });

    const seekingSourcesToUpdate: SeekSource[] = result.map((source) => ({
      name: source as SeekSources,
      mode: 'one',
    }));

    const supportedOneModeSeekSources = seekingSourcesToUpdate.filter(
      (seekingSource) =>
        SUPPORTED_MANY_SEEKING_SOURCES.includes(seekingSource.name)
    );

    for (const supportedOneModeSeekSource of supportedOneModeSeekSources) {
      seekingSourcesToUpdate.push({
        name: supportedOneModeSeekSource.name,
        mode: 'many',
      });
    }

    this.localStorageService.savePreferences(
      'seekingSources',
      seekingSourcesToUpdate
    );
    return [{ commandKey: 'show-settings-menu' }];
  }
}
