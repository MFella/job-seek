import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';

export class SolidJobsResolver extends SeekJobResolver {
  async resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]> {
    // TODO: implement SolidJobs scraping / API call
    return [];
  }
}
