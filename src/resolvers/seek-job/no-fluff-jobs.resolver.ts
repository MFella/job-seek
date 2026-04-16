import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';

export class NoFluffJobsResolver extends SeekJobResolver {
  async resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]> {
    // TODO: implement NoFluffJobs scraping / API call
    return [];
  }
}
