import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import { select } from '@inquirer/prompts';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { SeekJobService } from '../../services/seek-job.service.ts';
import { CommandKey } from '../../questions/questions.ts';

export class SeekJobsCommand extends BaseCommand {
  private static readonly COMMAND_KEY: CommandKey = 'seek-jobs';

  constructor(
    protected readonly message: string,
    private readonly localStorageService: LocalStorageService,
    private readonly seekJobService: SeekJobService
  ) {
    super(message);
  }

  getKey(): CommandKey {
    return SeekJobsCommand.COMMAND_KEY;
  }

  async execute(): Promise<NextCommandToExecute[]> {
    const jobSeekSettings = await this.localStorageService.loadPreferences();

    if (!jobSeekSettings || Object.keys(jobSeekSettings).length === 0) {
      // TODO: Use logger instead of console.log
      console.log('No job seek settings found. Please adjust settings.');
      return [{ commandKey: 'show-main-menu' }];
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
      return [{ commandKey: 'show-main-menu' }];
    }
    // TODO: Use logger instead of console.log
    console.log('Seeking jobs with config: ', jobSeekSettings);

    const seekedJobs = await this.seekJobService.seekJobs({
      seekSources: jobSeekSettings.seekingSources,
      techstack: jobSeekSettings.techstack,
    });

    const selectedJob = await select({
      choices: seekedJobs.map((jobOffer) => ({
        value: jobOffer.id,
        slug: jobOffer.slug,
        name: `${jobOffer.title} | ${jobOffer.company}`,
      })),
      pageSize: 5,
      message: this.message,
    });

    const selectedJobOffer = seekedJobs.find(
      (jobOffer) => jobOffer.id === selectedJob
    );

    console.log('Slug: ', selectedJobOffer?.slug, selectedJobOffer?.seekSource);
    return [{ commandKey: 'seek-job', config: { slug: selectedJobOffer?.slug, seekSource: selectedJobOffer?.seekSource } }];
  }
}
