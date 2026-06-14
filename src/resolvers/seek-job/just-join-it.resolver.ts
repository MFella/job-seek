import {
  SeekJobDetailsSuffixConfig,
  SeekJobResolver,
} from '../seek-job.resolver.ts';
import type {
  DetailedJobOfferRaw,
  GetJobBoardJobsApiResponse,
  GetJobBoardSingleJobApiResponse,
  JobOfferRaw,
  SeekJobRequest,
  SeekJobsRequest,
} from '../seek-job.d.ts';
import { inject, singleton } from 'tsyringe';
import type { AuthSession } from '../../services/web-scrapper.service.ts';
import { WebScrapperService } from '../../services/web-scrapper.service.ts';
import { RestDataService } from '../../rest/rest-data.service.ts';

type Request = SeekJobsRequest<'just-join-it'>;
type KyHeadersInit = NonNullable<RequestInit['headers']> | Record<string, string | undefined>;

@singleton()
export class JustJoinItResolver extends SeekJobResolver<'just-join-it'> {
  private static readonly JOB_OFFERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  private authSession: AuthSession | null = null;
  private cachedResolvedJobsMap: Map<string, { savedDate: Date; offers: JobOfferRaw<'just-join-it'>[] }> = new Map();

  constructor(
    @inject(RestDataService) restDataService: RestDataService,
    @inject(WebScrapperService) webScrapperService: WebScrapperService
  ) {
    super(restDataService, webScrapperService);
  }

  async resolveMany(seekJobsRequest: Request): Promise<JobOfferRaw<'just-join-it'>[]> {
    const cacheKey = btoa(JSON.stringify(seekJobsRequest));
    const cachedData = this.cachedResolvedJobsMap.get(cacheKey);

    if (cachedData) {
      const timeDiff = new Date().getTime() - cachedData.savedDate.getTime();
      if (timeDiff < JustJoinItResolver.JOB_OFFERS_CACHE_TTL_MS) {
        console.log('Using cached job offers');
        return cachedData.offers;
      }
    }

    if (!this.authSession) {
      this.authSession = await this.retryAuthSession();
    }

    const jobOffers = await this.restDataService.get<
      GetJobBoardJobsApiResponse<'just-join-it'>
    >(this.getSeekJobsUrl(seekJobsRequest), {
      headers: this.getKyGetHeaders()
    });

    console.log("Fetched list length: ", jobOffers.data.length);
    const mappedJobOffers = jobOffers.data.map((jobOffer) => ({
      title: jobOffer.title,
      company: jobOffer.companyName,
      url: jobOffer.slug,
      postedAt: jobOffer.publishedAt,
      id: jobOffer.guid,
      slug: jobOffer.slug,
      seekSource: 'just-join-it'
    })) satisfies JobOfferRaw<'just-join-it'>[];

    this.cachedResolvedJobsMap.set(cacheKey, { savedDate: new Date(), offers: mappedJobOffers });
    return mappedJobOffers;
  }

  async resolveOne(seekJobRequest: SeekJobRequest<'just-join-it'>): Promise<DetailedJobOfferRaw<'just-join-it'>> {
    if (!this.authSession) {
      this.authSession = await this.retryAuthSession();
    }

    const jobOffer = await this.restDataService.get<
      GetJobBoardSingleJobApiResponse<'just-join-it'>
    >(this.getSeekJobUrl(seekJobRequest), {
      headers: this.getKyGetHeaders()
    });

    return { ...jobOffer, company: jobOffer.companyName, url: jobOffer.applyUrl, seekSource: 'just-join-it', description: jobOffer.body };
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

  private getSeekJobsUrl(seekJobsRequest: Request): string {
    return `${this.getBaseUrl()}${this.getSeekJobsSuffix(seekJobsRequest)}`;
  }

  private getSeekJobUrl(seekJobRequest: SeekJobRequest<'just-join-it'>): string {
    return `${this.getBaseUrl()}${this.getSeekJobDetailsSuffix(seekJobRequest)}`
  }

  private async retryAuthSession(): Promise<AuthSession> {
    return await this.webScrapperService.getAuthSession({
      url: this.getBaseUrl(),
      source: 'just-join-it',
    });
  }

  private getKyGetHeaders(): KyHeadersInit {
    return {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      Cookie: this.authSession?.cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join('; '),
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    }
  }
}
