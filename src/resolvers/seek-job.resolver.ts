import type { JobBoard, JobOfferRaw, SeekJobRequest } from './seek-job.d.ts';
import { RestDataService } from '../rest/rest-data.service.ts';
import { WebScrapperService } from '../services/web-scrapper.service.ts';
import { inject } from 'tsyringe';
import { SeekJobSettings } from '../services/seek-job.service.ts';

export type SeekJobDetailsSuffixConfig = {
  slug?: string;
};

export abstract class SeekJobResolver<T extends JobBoard> {
  constructor(
    @inject(RestDataService)
    protected readonly restDataService: RestDataService,
    @inject(WebScrapperService)
    protected readonly webScrapperService: WebScrapperService
  ) {}

  protected abstract getBaseUrl(seekJobRequest: SeekJobRequest<T>): string;
  protected abstract getSeekJobsSuffix(
    seekJobRequest: SeekJobRequest<T>
  ): string;
  protected abstract getSeekJobDetailsSuffix(
    config?: SeekJobDetailsSuffixConfig
  ): string;
  abstract resolve(seekJobRequest: SeekJobRequest<T>): Promise<JobOfferRaw[]>;
}
