import type { DetailedJobOfferRaw, JobOfferRaw, SeekJobRequest, SeekJobsRequest, SeekSources } from './seek-job.d.ts';
import { RestDataService } from '../rest/rest-data.service.ts';
import { WebScrapperService } from '../services/web-scrapper.service.ts';
import { inject } from 'tsyringe';

export type SeekJobDetailsSuffixConfig = {
  slug?: string;
};

export abstract class SeekJobResolver<T extends SeekSources> {
  constructor(
    @inject(RestDataService)
    protected readonly restDataService: RestDataService,
    @inject(WebScrapperService)
    protected readonly webScrapperService: WebScrapperService
  ) { }

  protected abstract getBaseUrl(seekJobRequest: SeekJobsRequest<T>): string;
  protected abstract getSeekJobsSuffix(
    seekJobRequest: SeekJobsRequest<T>
  ): string;
  protected abstract getSeekJobDetailsSuffix(
    config?: SeekJobDetailsSuffixConfig
  ): string;
  abstract resolveMany(seekJobRequest: SeekJobsRequest<T>): Promise<JobOfferRaw<T>[]>;

  abstract resolveOne(seekJobRequest: SeekJobRequest<T>): Promise<DetailedJobOfferRaw<T>>;
}
