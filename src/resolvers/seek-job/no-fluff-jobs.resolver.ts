import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';
import { injectable } from 'tsyringe';

type Request = SeekJobRequest<'nofluff'>;

@injectable()
export class NoFluffJobsResolver extends SeekJobResolver<'nofluff'> {
  async resolve(seekJobRequest: Request): Promise<JobOfferRaw[]> {
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
}
