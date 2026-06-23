import { inject, injectable } from 'tsyringe';
import { spawn } from 'child_process';
import { SeekSources } from '../resolvers/seek-job.js';
import { LoggerService } from '../logger/logger.service.ts';
import { firstValueFrom, fromEvent, race, Subject, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';

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
  constructor(
    @inject(LoggerService) private readonly logger: LoggerService
  ) {}

  async getAuthSession(config: CrawlerConfig): Promise<AuthSession> {
    const scrapperProcess = spawn('python3', [
      './scripts/nodriver_scrapper.py',
      config.url,
    ]);

    scrapperProcess.stdout.setEncoding('utf8');

    const abort$ = new Subject<never>();
    const onAbort = () => {
      scrapperProcess.stdin?.end();
      const killTimeout = setTimeout(() => {
        scrapperProcess.kill();
      }, 1500);
      scrapperProcess.on('exit', () => {
        clearTimeout(killTimeout);
      });
      abort$.error(new Error('Scrapper process terminated'));
    };

    if (config.abortSignal) {
      config.abortSignal.addEventListener('abort', onAbort);
    }

    const data$ = fromEvent<string>(scrapperProcess.stdout, 'data').pipe(
      take(1),
      map((data: string) => {
        scrapperProcess.stdout.destroy();
        try {
          const parsedData = JSON.parse(data) as Cookie[];
          return { cookies: parsedData };
        } catch (error: unknown) {
          this.logger.error(
            `Cannot retrieve job data from: ${config.source}`,
            error
          );
          throw error;
        }
      })
    );

    const timeout$ = timer(10_000).pipe(
      map(() => {
        scrapperProcess.stdin?.end();
        scrapperProcess.kill();
        throw new Error('Scrapper timeout - No response within threshold');
      })
    );

    try {
      return await firstValueFrom(race(data$, timeout$, abort$));
    } finally {
      if (config.abortSignal) {
        config.abortSignal.removeEventListener('abort', onAbort);
      }
    }
  }
}
