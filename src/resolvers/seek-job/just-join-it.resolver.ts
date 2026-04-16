import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';

export class JustJoinItResolver extends SeekJobResolver {
  async resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]> {
    // TODO: implement JustJoin.it scraping / API call
    return [];
  }
}
