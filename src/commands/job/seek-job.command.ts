import { BaseCommand } from '../base-command.ts';
import { select } from '@inquirer/prompts';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { SeekJobService } from '../../services/seek-job.service.ts';

export class SeekJobCommand extends BaseCommand<string> {
  constructor(
    protected readonly message: string,
    private readonly localStorageService: LocalStorageService,
    private readonly seekJobService: SeekJobService
  ) {
    super(message);
  }

  async execute(): Promise<string> {
    // TODO: load job seek settings
    const jobSeekSettings = await this.localStorageService.loadPreferences();

    if (!jobSeekSettings || Object.keys(jobSeekSettings).length === 0) {
      // TODO: Use logger instead of console.log
      console.log('No job seek settings found. Please adjust settings.');
      return '';
    } else if (
      !jobSeekSettings.techstack ||
      jobSeekSettings.techstack?.length === 0 ||
      !jobSeekSettings.seekingSources ||
      jobSeekSettings.seekingSources?.length === 0
    ) {
      // TODO: Use logger instead of console.log
      console.log(
        'No techstack or seeking sources found. Please adjust settings.'
      );
      return '';
    }
    // TODO: Use logger instead of console.log
    console.log('Seeking jobs with config: ', jobSeekSettings);

    // TODO: implement job seeking logic

    const seekedJobs = await this.seekJobService.seekJobs({
      seekSources: jobSeekSettings.seekingSources,
      techstack: jobSeekSettings.techstack,
    });

    return await select({
      choices: seekedJobs.map((jobOffer) => ({
        value: jobOffer.id,
        name: `${jobOffer.title} | ${jobOffer.company}`,
      })),
      pageSize: 5,
      message: this.message,
    });
  }
}
