import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';
import { injectable } from 'tsyringe';

type Request = SeekJobRequest<'protocol'>;

@injectable()
export class ProtocolItResolver extends SeekJobResolver<'protocol'> {
  async resolve(seekJobRequest: Request): Promise<JobOfferRaw[]> {
    // TODO: implement Protocol.it scraping / API call
    return [];
  }

  protected getBaseUrl(seekJobRequest: Request): string {
    return 'https://protocol.it';
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
