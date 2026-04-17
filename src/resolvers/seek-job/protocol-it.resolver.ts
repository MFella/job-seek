import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';
import { injectable } from 'tsyringe';

@injectable()
export class ProtocolItResolver extends SeekJobResolver {
  async resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]> {
    // TODO: implement Protocol.it scraping / API call
    return [];
  }

  protected getBaseUrl(seekJobRequest: SeekJobRequest): string {
    return 'https://protocol.it';
  }
}
