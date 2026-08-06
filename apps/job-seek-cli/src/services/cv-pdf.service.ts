import { inject, injectable } from 'tsyringe';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { LoggerService } from '../logger/logger.service.ts';
import { CvLayout, renderCvHtml } from '../templates/cv-template.ts';
import { TailoredCv } from '../types/tailored-cv.ts';

@injectable()
export class CvPdfService {
  constructor(@inject(LoggerService) private readonly logger: LoggerService) {}

  async generatePdf(
    cv: TailoredCv,
    outputPath: string,
    layout: CvLayout
  ): Promise<void> {
    await mkdir(dirname(outputPath), { recursive: true });

    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await page.setContent(renderCvHtml(cv, layout), {
        waitUntil: 'networkidle',
      });
      // Zero margins - the layouts handle their own padding, and some rely on
      // full-bleed color bands/panels reaching the page edges.
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });
    } catch (error) {
      this.logger.error('Failed to generate CV PDF', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
