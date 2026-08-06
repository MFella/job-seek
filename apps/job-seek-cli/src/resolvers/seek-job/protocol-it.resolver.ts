import { SeekJobResolver } from '../seek-job.resolver.ts';
import type {
  DetailedJobOfferRaw,
  JobOfferRaw,
  SeekJobsRequest,
} from '../seek-job.d.ts';
import { injectable } from 'tsyringe';

type Request = SeekJobsRequest<'protocol-it'>;

@injectable()
export class ProtocolItResolver extends SeekJobResolver<'protocol-it'> {
  async resolveMany(
    seekJobRequest: Request
  ): Promise<JobOfferRaw<'protocol-it'>[]> {
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

  async resolveOne(
    seekJobRequest: Request
  ): Promise<DetailedJobOfferRaw<'protocol-it'>> {
    // TODO: implement ProtocolIt scraping / API call
    return {} as DetailedJobOfferRaw<'protocol-it'>;
  }
}
