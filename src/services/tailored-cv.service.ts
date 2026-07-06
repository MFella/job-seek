import { inject, injectable } from 'tsyringe';
import { RestDataService } from '../rest/rest-data.service.ts';
import { LoggerService } from '../logger/logger.service.ts';
import { ConfigService } from '../config/config.service.ts';
import { MasterCv, TailoredCv } from '../types/tailored-cv.ts';

type GeminiGenerateContentResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
};

const TAILORED_CV_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    fullName: { type: 'string' },
    contact: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        links: { type: 'array', items: { type: 'string' } },
      },
    },
    summary: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['company', 'title', 'startDate', 'bullets'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
        },
        required: ['institution', 'degree'],
      },
    },
    certifications: { type: 'array', items: { type: 'string' } },
    languages: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'fullName',
    'contact',
    'summary',
    'skills',
    'experience',
    'education',
  ],
};

@injectable()
export class TailoredCvService {
  constructor(
    @inject(RestDataService) private readonly restDataService: RestDataService,
    @inject(LoggerService) private readonly logger: LoggerService
  ) {}

  async generateTailoredCv(
    masterCv: MasterCv,
    jobDescription: string,
    jobTitle: string,
    company: string,
    abortSignal?: AbortSignal
  ): Promise<TailoredCv> {
    const apiKey = ConfigService.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to a .env file at the project root.'
      );
    }

    const prompt = [
      'You are tailoring a candidate CV for a specific job application.',
      "You are given the candidate's master CV (their real, truthful data) as JSON, and a job description.",
      "Rewrite the CV so it is targeted at the job: reprioritize and reorder skills and experience bullets, and rephrase wording to match the job description's terminology.",
      'Rules you MUST follow:',
      '- Never invent employers, job titles, dates, degrees, or skills that are not present in the master CV.',
      '- You may reword, reorder, and re-emphasize existing content, but every fact must remain truthful and traceable to the master CV.',
      '- Return the full CV, not just the parts you changed.',
      '',
      `Job title: ${jobTitle}`,
      `Company: ${company}`,
      'Job description:',
      jobDescription,
      '',
      'Master CV:',
      JSON.stringify(masterCv),
    ].join('\n');

    const response =
      await this.restDataService.post<GeminiGenerateContentResponse>(
        `https://generativelanguage.googleapis.com/v1beta/models/${ConfigService.GEMINI_MODEL}:generateContent`,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: TAILORED_CV_RESPONSE_SCHEMA,
          },
        },
        {
          searchParams: { key: apiKey },
          signal: abortSignal,
        }
      );

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      this.logger.error('Gemini returned no content', response);
      throw new Error('Gemini returned no tailored CV content.');
    }

    return JSON.parse(text) as TailoredCv;
  }
}
