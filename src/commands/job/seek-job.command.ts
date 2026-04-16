import { BaseCommand } from '../base-command.ts';
import type { SelectChoiceItem } from '../../common/inquirer.js';
import { select } from '@inquirer/prompts';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { SeekJobService } from '../../services/seek-job.service.ts';

export class SeekJobCommand<T extends string> extends BaseCommand<T> {
  constructor(
    protected readonly message: string,
    protected readonly choices: SelectChoiceItem<T>[],
    private readonly localStorageService: LocalStorageService,
    private readonly seekJobService: SeekJobService
  ) {
    super(message);
  }

  async execute(): Promise<T> {
    // TODO: load job seek settings
    const jobSeekSettings = await this.localStorageService.loadPreferences();

    if (!jobSeekSettings || Object.keys(jobSeekSettings).length === 0) {
      // TODO: Use logger instead of console.log
      console.log('No job seek settings found. Please adjust settings.');
      return '' as T;
    }
    // TODO: Use logger instead of console.log
    console.log('Seeking jobs with config: ', jobSeekSettings);

    // TODO: implement job seeking logic

    const seekedJobs = await this.seekJobService.seekJobs({
      seekSources: jobSeekSettings.seekingSources,
      techstack: jobSeekSettings.techstack,
    });

    return await select({
      choices: this.choices,
      message: this.message,
    });
  }
}
