import type { JobOfferRaw, SeekJobRequest } from './seek-job.d.ts';
import { RestDataService } from '../rest/rest-data.service.ts';
import { WebScrapperService } from '../services/web-scrapper.service.ts';
import { inject } from 'tsyringe';

export abstract class SeekJobResolver {
  constructor(
    @inject(RestDataService)
    protected readonly restDataService: RestDataService,
    @inject(WebScrapperService)
    protected readonly webScrapperService: WebScrapperService
  ) {}

  protected abstract getBaseUrl(seekJobRequest: SeekJobRequest): string;
  abstract resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]>;
}
