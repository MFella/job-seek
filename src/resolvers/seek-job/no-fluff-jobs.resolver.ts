import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { DetailedJobOfferRaw, JobOfferRaw, SeekJobsRequest } from '../seek-job.d.ts';
import { injectable } from 'tsyringe';

type Request = SeekJobsRequest<'no-fluff-jobs'>;

@injectable()
export class NoFluffJobsResolver extends SeekJobResolver<'no-fluff-jobs'> {
  async resolveMany(seekJobRequest: Request): Promise<JobOfferRaw<'no-fluff-jobs'>[]> {
    // TODO: implement NoFluffJobs scraping / API call
    return [];
  }

  protected getBaseUrl(seekJobRequest: Request): string {
    return 'https://nofluffjobs.com';
  }

  protected getSeekJobsSuffix(seekJobRequest: Request): string {
    // TODO: implement this
    return '';
  }

  protected getSeekJobDetailsSuffix(): string {
    // TODO: implement this
    return '';
  }

  private getSeekJobsUrl(seekJobRequest: Request): string {
    // TODO: implement this
    return '';
  }

  async resolveOne(seekJobRequest: Request): Promise<DetailedJobOfferRaw<'no-fluff-jobs'>> {
    // TODO: implement NoFluffJobs scraping / API call
    return {} as DetailedJobOfferRaw<'no-fluff-jobs'>;
  }
}
