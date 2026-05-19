import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';
import { injectable } from 'tsyringe';
import { SeekJobSettings } from '../../services/seek-job.service.ts';

type Request = SeekJobRequest<'solid'>;

@injectable()
export class SolidJobsResolver extends SeekJobResolver<'solid'> {
  async resolve(seekJobRequest: Request): Promise<JobOfferRaw[]> {
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
}
