import { SeekJobResolver } from '../seek-job.resolver.ts';
import type { JobOfferRaw, SeekJobRequest } from '../seek-job.d.ts';
import { inject, injectable } from 'tsyringe';
import type { AuthSession } from '../../services/web-scrapper.service.ts';
import { WebScrapperService } from '../../services/web-scrapper.service.ts';
import { RestDataService } from '../../rest/rest-data.service.ts';

@injectable()
export class JustJoinItResolver extends SeekJobResolver {
  private authSession: AuthSession | null = null;

  constructor(
    @inject(RestDataService) restDataService: RestDataService,
    @inject(WebScrapperService) webScrapperService: WebScrapperService
  ) {
    super(restDataService, webScrapperService);
  }

  async resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]> {
    const jobOffers =
      await this.webScrapperService.resolveRequest<'justjoinit'>({
        url: this.getBaseUrl(seekJobRequest),
        source: 'justjoinit',
      });

    return jobOffers.data.map((jobOffer) => ({
      title: jobOffer.title,
      company: jobOffer.companyName,
      url: jobOffer.slug,
      postedAt: jobOffer.publishedAt,
      id: jobOffer.guid,
    }));
  }

  protected getBaseUrl(seekJobRequest: SeekJobRequest): string {
    // return 'https://justjoin.it';
    return `https://justjoin.it/api/candidate-api/offers?from=0&itemsCount=300&currency=pln&orderBy=descending&sortBy=publishedAt&keywords=${seekJobRequest.techstack.join(',')}`;
  }
}
