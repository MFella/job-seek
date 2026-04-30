import { injectable } from 'tsyringe';
import { spawn } from 'child_process';
import { JustJoinItJobApiResponse } from '../resolvers/just-join-it.ts';
import { JobBoard, GetJobBoardJobsApiResponse } from '../resolvers/seek-job.js';

export type AuthSession = {
  cookies: Cookie[];
};

export type Cookie = {
  name: string;
  value: string;
};

type CrawlerConfig = {
  url: string;
  source: JobBoard | null;
};

@injectable()
export class WebScrapperService {
  private crawlerConfig: CrawlerConfig = {
    url: '',
    source: null,
  };

  async resolveRequest<T extends JobBoard>(
    config: CrawlerConfig
  ): Promise<GetJobBoardJobsApiResponse<T>> {
    this.crawlerConfig = config;
    const response = spawn('python3', [
      './scripts/nodriver_scrapper.py',
      this.crawlerConfig.url,
    ]);

    return new Promise((resolve, reject) => {
      response.stdout.setEncoding('utf8');
      response.stdout.on('data', (data: string) => {
        try {
          const parsedData = JSON.parse(data) as GetJobBoardJobsApiResponse<T>;
          resolve(parsedData);
        } catch (error: unknown) {
          console.error(
            `Cannot retrieve job data from: ${this.crawlerConfig.source}`,
            error
          );
          reject(error);
        }
      });
    });
  }
}
