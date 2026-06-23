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
  abortSignal?: AbortSignal;
};

@injectable()
export class WebScrapperService {
  async getAuthSession(config: CrawlerConfig): Promise<AuthSession> {
    const scrapperProcess = spawn('python3', [
      './scripts/nodriver_scrapper.py',
      config.url,
    ]);

    return new Promise((resolve, reject) => {
      if (config.abortSignal) {
        config.abortSignal.addEventListener('abort', () => {
          scrapperProcess.stdin?.end();

          const killTimeout = setTimeout(() => {
            scrapperProcess.kill();
          }, 1500);

          scrapperProcess.on('exit', () => {
            clearTimeout(killTimeout);
          });

          reject(new Error('Scrapper process terminated'));
        });
      }

      scrapperProcess.stdout.setEncoding('utf8');
      scrapperProcess.stdout.on('data', (data: string) => {
        try {
          const parsedData = JSON.parse(data) as Cookie[];
          resolve({ cookies: parsedData });
        } catch (error: unknown) {
          console.error(
            `Cannot retrieve job data from: ${config.source}`,
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
