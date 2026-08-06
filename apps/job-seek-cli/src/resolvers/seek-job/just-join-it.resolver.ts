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
import { HTTPError } from 'ky';
import type { AuthSession } from '../../services/web-scrapper.service.ts';
import { WebScrapperService } from '../../services/web-scrapper.service.ts';
import { RestDataService } from '../../rest/rest-data.service.ts';
import { LoggerService } from '../../logger/logger.service.ts';
import { LocalStorageService } from '../../services/local-storage.service.ts';

type Request = SeekJobsRequest<'just-join-it'>;
type KyHeadersInit =
  | NonNullable<RequestInit['headers']>
  | Record<string, string | undefined>;

@singleton()
export class JustJoinItResolver extends SeekJobResolver<'just-join-it'> {
  private static readonly JOB_OFFERS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  private static readonly AUTH_SESSION_TTL_MS = 45 * 60 * 1000;

  private authSession: AuthSession | null = null;
  private cachedResolvedJobsMap: Map<
    string,
    { savedDate: Date; offers: JobOfferRaw<'just-join-it'>[] }
  > = new Map();

  constructor(
    @inject(RestDataService) restDataService: RestDataService,
    @inject(WebScrapperService) webScrapperService: WebScrapperService,
    @inject(LoggerService) private readonly logger: LoggerService,
    @inject(LocalStorageService)
    private readonly localStorageService: LocalStorageService
  ) {
    super(restDataService, webScrapperService);
  }

  async resolveMany(
    seekJobsRequest: Request,
    abortSignal?: AbortSignal
  ): Promise<JobOfferRaw<'just-join-it'>[]> {
    const cacheKey = btoa(JSON.stringify(seekJobsRequest));
    const cachedData = this.cachedResolvedJobsMap.get(cacheKey);

    if (cachedData) {
      const timeDiff = new Date().getTime() - cachedData.savedDate.getTime();
      if (timeDiff < JustJoinItResolver.JOB_OFFERS_CACHE_TTL_MS) {
        this.logger.info('Using cached job offers');
        return cachedData.offers;
      }
    }

    await this.getOrRefreshAuthSession(abortSignal);

    const jobOffers = await this.fetchWithAuthRetry(
      () =>
        this.restDataService.get<GetJobBoardJobsApiResponse<'just-join-it'>>(
          this.getSeekJobsUrl(seekJobsRequest),
          { headers: this.getKyGetHeaders(), signal: abortSignal }
        ),
      abortSignal
    );

    this.logger.info(`Fetched list length: ${jobOffers.data.length}`);
    const mappedJobOffers = jobOffers.data.map((jobOffer) => ({
      title: jobOffer.title,
      company: jobOffer.companyName,
      url: jobOffer.slug,
      postedAt: jobOffer.publishedAt,
      id: jobOffer.guid,
      slug: jobOffer.slug,
      seekSource: 'just-join-it',
    })) satisfies JobOfferRaw<'just-join-it'>[];

    this.cachedResolvedJobsMap.set(cacheKey, {
      savedDate: new Date(),
      offers: mappedJobOffers,
    });
    return mappedJobOffers;
  }

  async resolveOne(
    seekJobRequest: SeekJobRequest<'just-join-it'>,
    abortSignal?: AbortSignal
  ): Promise<DetailedJobOfferRaw<'just-join-it'>> {
    await this.getOrRefreshAuthSession(abortSignal);

    const jobOffer = await this.fetchWithAuthRetry(
      () =>
        this.restDataService.get<
          GetJobBoardSingleJobApiResponse<'just-join-it'>
        >(this.getSeekJobUrl(seekJobRequest), {
          headers: this.getKyGetHeaders(),
          signal: abortSignal,
        }),
      abortSignal
    );

    return {
      ...jobOffer,
      company: jobOffer.companyName,
      url: jobOffer.applyUrl,
      seekSource: 'just-join-it',
      description: jobOffer.body,
    };
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

  private getSeekJobUrl(
    seekJobRequest: SeekJobRequest<'just-join-it'>
  ): string {
    return `${this.getBaseUrl()}${this.getSeekJobDetailsSuffix(seekJobRequest)}`;
  }

  private async getOrRefreshAuthSession(
    abortSignal?: AbortSignal
  ): Promise<AuthSession> {
    if (this.authSession) {
      return this.authSession;
    }

    const cached = await this.localStorageService.loadPreferences(
      'justJoinItAuthSession'
    );
    if (
      cached &&
      Date.now() - new Date(cached.fetchedAt).getTime() <
        JustJoinItResolver.AUTH_SESSION_TTL_MS
    ) {
      this.logger.info('Using cached just-join-it auth session');
      this.authSession = { cookies: cached.cookies };
      return this.authSession;
    }

    return this.refreshAuthSession(abortSignal);
  }

  private async refreshAuthSession(
    abortSignal?: AbortSignal
  ): Promise<AuthSession> {
    const authSession = await this.retryAuthSession(abortSignal);
    this.authSession = authSession;
    await this.localStorageService.savePreferences('justJoinItAuthSession', {
      cookies: authSession.cookies,
      fetchedAt: new Date().toISOString(),
    });
    return authSession;
  }

  private async fetchWithAuthRetry<T>(
    request: () => Promise<T>,
    abortSignal?: AbortSignal
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (
        error instanceof HTTPError &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        this.logger.info(
          'just-join-it rejected cached auth session, refreshing and retrying once'
        );
        this.authSession = null;
        await this.refreshAuthSession(abortSignal);
        return await request();
      }
      throw error;
    }
  }

  private async retryAuthSession(
    abortSignal?: AbortSignal
  ): Promise<AuthSession> {
    return await this.webScrapperService.getAuthSession({
      url: this.getBaseUrl(),
      source: 'just-join-it',
      abortSignal,
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
    };
  }
}
