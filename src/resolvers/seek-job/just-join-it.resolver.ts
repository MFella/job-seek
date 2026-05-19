import {
  SeekJobDetailsSuffixConfig,
  SeekJobResolver,
} from '../seek-job.resolver.ts';
import type {
  GetJobBoardJobsApiResponse,
  JobOfferRaw,
  SeekJobRequest,
} from '../seek-job.d.ts';
import { inject, injectable } from 'tsyringe';
import type { AuthSession } from '../../services/web-scrapper.service.ts';
import { WebScrapperService } from '../../services/web-scrapper.service.ts';
import { RestDataService } from '../../rest/rest-data.service.ts';

type Request = SeekJobRequest<'justjoinit'>;

@injectable()
export class JustJoinItResolver extends SeekJobResolver<'justjoinit'> {
  private authSession: AuthSession | null = null;

  constructor(
    @inject(RestDataService) restDataService: RestDataService,
    @inject(WebScrapperService) webScrapperService: WebScrapperService
  ) {
    super(restDataService, webScrapperService);
  }

  async resolve(seekJobRequest: Request): Promise<JobOfferRaw[]> {
    const authSession = await this.webScrapperService.getAuthSession({
      url: this.getBaseUrl(),
      source: 'justjoinit',
    });
    console.log('authSession ', authSession);
    this.authSession = authSession;

    const jobOffers = await this.restDataService.get<
      GetJobBoardJobsApiResponse<'justjoinit'>
    >(this.getSeekJobsUrl(seekJobRequest), {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        Cookie: this.authSession.cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join('; '),
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
      },
    });

    console.log('WE have got this ', jobOffers);
    return jobOffers.data.map((jobOffer) => ({
      title: jobOffer.title,
      company: jobOffer.companyName,
      url: jobOffer.slug,
      postedAt: jobOffer.publishedAt,
      id: jobOffer.guid,
      slug: jobOffer.slug,
    }));
  }

  protected getBaseUrl(): string {
    return 'https://justjoin.it/';
  }

  protected getSeekJobsSuffix(seekJobRequest: Request): string {
    return `api/candidate-api/offers?from=0&itemsCount=300&currency=pln&orderBy=descending&sortBy=publishedAt&keywords=${seekJobRequest.techstack.join(',')}`;
  }

  protected getSeekJobDetailsSuffix(
    config?: SeekJobDetailsSuffixConfig
  ): string {
    return `api/candidate-api/offers/${config?.slug ?? ''}`;
  }

  private getSeekJobsUrl(seekJobRequest: Request): string {
    return `${this.getBaseUrl()}${this.getSeekJobsSuffix(seekJobRequest)}`;
  }
}
