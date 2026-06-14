import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { DetailedJobOfferRaw, JobOfferRaw, SeekJobsRequest } from '../seek-job.d.ts';
import { injectable } from 'tsyringe';

type Request = SeekJobsRequest<'solid-jobs'>;

@injectable()
export class SolidJobsResolver extends SeekJobResolver<'solid-jobs'> {
  async resolveMany(seekJobRequest: Request): Promise<JobOfferRaw<'solid-jobs'>[]> {
    // TODO: implement SolidJobs scraping / API call
    return [];
  }

  protected getBaseUrl(seekJobRequest: Request): string {
    return 'https://solid.jobs';
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

  async resolveOne(seekJobRequest: Request): Promise<DetailedJobOfferRaw<'solid-jobs'>> {
    // TODO: implement SolidJobs scraping / API call
    return {} as DetailedJobOfferRaw<'solid-jobs'>;
  }
}
