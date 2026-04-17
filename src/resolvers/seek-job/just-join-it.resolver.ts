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
    if (!this.authSession) {
      await this.webScrapperService.refreshCloudflareToken({
        url: this.getBaseUrl(seekJobRequest),
        onPageLoaded: (event) => {
          this.authSession = { cookies: event.cookies };
        },
      });
    }

    try {
      const response = await this.restDataService.get(
        `${this.getBaseUrl(seekJobRequest)}`,
        {
          headers: {
            Cookie: this.authSession?.cookies
              .map((cookie) => `${cookie.name}=${cookie.value}`)
              .join('; '),
          },
        }
      );
      console.log('hehe', response);
    } catch (error: unknown) {
      console.log('error Occurred', error);
      return [];
    }
    return [];
  }

  protected getBaseUrl(seekJobRequest: SeekJobRequest): string {
    return `https://justjoin.it/api/candidate-api/offers?from=0&itemsCount=300&currency=pln&orderBy=descending&sortBy=publishedAt&keywords=${seekJobRequest.techstack.join(',')}`;
  }
}
