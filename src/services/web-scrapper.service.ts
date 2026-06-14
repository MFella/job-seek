import { injectable } from 'tsyringe';
import { spawn } from 'child_process';
import { SeekSources } from '../resolvers/seek-job.js';

export type AuthSession = {
  cookies: Cookie[];
};

export type Cookie = {
  name: string;
  value: string;
};

type CrawlerConfig = {
  url: string;
  source: SeekSources | null;
};

@injectable()
export class WebScrapperService {
  private crawlerConfig: CrawlerConfig = {
    url: '',
    source: null,
  };

  async getAuthSession(config: CrawlerConfig): Promise<AuthSession> {
    this.crawlerConfig = config;
    const scrapperProcess = spawn('python3', [
      './scripts/nodriver_scrapper.py',
      this.crawlerConfig.url,
    ]);

    return new Promise((resolve, reject) => {
      scrapperProcess.stdout.setEncoding('utf8');
      scrapperProcess.stdout.on('data', (data: string) => {
        try {
          const parsedData = JSON.parse(data) as Cookie[];
          resolve({ cookies: parsedData });
        } catch (error: unknown) {
          console.error(
            `Cannot retrieve job data from: ${this.crawlerConfig.source}`,
            error
          );
          reject(error);
        }

        // We're interested in the first chunk of data
        scrapperProcess.stdout.destroy();
      });
    });
  }
}
