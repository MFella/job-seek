import { readFile } from 'node:fs/promises';
import { input, select } from '@inquirer/prompts';
import { BaseCommand, NextCommandToExecute } from '../base-command.ts';
import { CommandConfigs, CommandKey } from '../../questions/questions.ts';
import { LocalStorageService } from '../../services/local-storage.service.ts';
import { TailoredCvService } from '../../services/tailored-cv.service.ts';
import { CvPdfService } from '../../services/cv-pdf.service.ts';
import { LoggerService } from '../../logger/logger.service.ts';
import { MasterCv } from '../../types/tailored-cv.ts';
import { CV_LAYOUTS, CvLayout } from '../../templates/cv-template.ts';
import open from 'open';

const sanitizeForFilename = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export class GenerateTailoredCvCommand extends BaseCommand<'generate-tailored-cv'> {
  private static readonly COMMAND_KEY: CommandKey = 'generate-tailored-cv';

  constructor(
    protected readonly message: string,
    private readonly localStorageService: LocalStorageService,
    private readonly tailoredCvService: TailoredCvService,
    private readonly cvPdfService: CvPdfService,
    private readonly logger: LoggerService
  ) {
    super(message, false);
  }

  getKey(): CommandKey {
    return GenerateTailoredCvCommand.COMMAND_KEY;
  }

  async execute(
    config?: CommandConfigs['generate-tailored-cv']
  ): Promise<NextCommandToExecute[]> {
    if (!config) {
      this.logger.warn('No config found. Skipping');
      return [
        { commandKey: 'go-back', config: { commandKeyToRewind: 'seek-jobs' } },
      ];
    }

    const masterCv = await this.loadMasterCv();

    this.logger.info('Generating tailored CV with Gemini...');
    const tailoredCv = await this.tailoredCvService.generateTailoredCv(
      masterCv,
      config.jobDescriptionText,
      config.jobTitle,
      config.company,
      this.executionTerminationSignal
    );

    const layout = await select<CvLayout>(
      {
        message: 'Which resume layout would you like?',
        choices: CV_LAYOUTS.map(({ value, name, description }) => ({
          value,
          name,
          description,
        })),
      },
      { signal: this.executionTerminationSignal }
    );

    const outputPath = await input(
      {
        message: 'Where should the tailored CV PDF be saved?',
        default: `./${sanitizeForFilename(config.company)}-${sanitizeForFilename(config.jobTitle)}-cv.pdf`,
      },
      { signal: this.executionTerminationSignal }
    );

    await this.cvPdfService.generatePdf(tailoredCv, outputPath, layout);
    this.logger.info(`Tailored CV saved to: ${outputPath}`);

    try {
      await open(outputPath, { wait: false });
    } catch (e) {
      this.logger.error('Failed to open generated CV', e);
    }

    return [
      { commandKey: 'go-back', config: { commandKeyToRewind: 'seek-jobs' } },
    ];
  }

  private async loadMasterCv(): Promise<MasterCv> {
    let masterCvPath =
      await this.localStorageService.loadPreferences('masterCvPath');

    if (!masterCvPath) {
      masterCvPath = await input(
        {
          message: 'Path to your master CV JSON file:',
          validate: async (value) => {
            try {
              JSON.parse(await readFile(value, 'utf-8'));
              return true;
            } catch {
              return 'Could not read/parse that file as JSON.';
            }
          },
        },
        { signal: this.executionTerminationSignal }
      );

      await this.localStorageService.savePreferences(
        'masterCvPath',
        masterCvPath
      );
    }

    return JSON.parse(await readFile(masterCvPath, 'utf-8')) as MasterCv;
  }
}
