import { injectable } from 'tsyringe';
import { Cookie, PlaywrightCrawler, PlaywrightRequestHandler } from 'crawlee';

type PageLoadedEvent = {
  cookies: Cookie[];
};

export type AuthSession = {
  cookies: Cookie[];
};

type CrawlerConfig = {
  url: string;
  onPageLoaded: (event: PageLoadedEvent) => void;
};

@injectable()
export class WebScrapperService {
  constructor() {}

  private crawlerConfig: CrawlerConfig = {
    url: '',
    onPageLoaded: () => {},
  };

  private readonly requestHandler: PlaywrightRequestHandler = async ({
    page,
  }) => {
    // Wchodzimy na stronę główną
    await page.goto(this.crawlerConfig.url);

    // Czekamy na załadowanie kluczowego elementu (dowód przejścia CF)
    await page.waitForSelector('header', { timeout: 20000 });

    // Wyciągamy ciastka i User-Agent
    const cookies = await page.context().cookies();

    this.crawlerConfig.onPageLoaded({ cookies });
  };

  private readonly crawler = new PlaywrightCrawler({
    browserPoolOptions: { useFingerprints: true }, // To jest klucz do sukcesu Crawlee
    maxRequestsPerCrawl: 1,
    requestHandler: this.requestHandler,
  });

  async refreshCloudflareToken(config: CrawlerConfig): Promise<void> {
    this.crawlerConfig = config;
    await this.crawler.run([config.url]);
  }
}
