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

// The subset of the CV that's actually worth having an LLM rewrite. Contact info, dates,
// employers, degrees etc. are objective facts that should never be regenerated - they're
// copied straight from the master CV instead, which also shrinks the output surface area
// available for the model to corrupt.
type TailoredCvContent = {
  summary: string;
  skills: string[];
  experience: {
    company: string;
    title: string;
    bullets: string[];
  }[];
};

// Some job sources return double-HTML-encoded descriptions, so html-to-text
// decodes entities into literal "<p>"-style text instead of stripping real tags.
// Feeding that noise to Gemini blows up "thinking" latency, so strip it defensively.
const stripResidualHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// LLMs occasionally get stuck in a degenerate repetition loop (e.g. one character repeated
// thousands of times) that still produces schema-valid JSON, so this can't be caught by
// response validation alone - it needs a content sanity check.
const REPEATED_CHAR_PATTERN = /(.)\1{15,}/;
const MAX_FIELD_LENGTH = 2000;

const isSuspiciousText = (value: string): boolean =>
  value.length > MAX_FIELD_LENGTH || REPEATED_CHAR_PATTERN.test(value);

// A curated set of concrete, named technologies/tools - deliberately NOT generic descriptive
// language (e.g. "scalable", "collaborative"). Matching the job description's tone/wording for
// that kind of language is legitimate and encouraged (helps with ATS keyword matching); what
// this guards against is the model claiming a specific hard skill the candidate doesn't have,
// borrowed straight from the job posting (observed in practice: "Java"/"Spring Boot" appearing
// in prose for a candidate whose master CV never mentions either).
const KNOWN_TECH_TERMS = [
  'java',
  'python',
  'javascript',
  'typescript',
  'golang',
  'rust',
  'c++',
  'c#',
  '.net',
  'php',
  'ruby',
  'rails',
  'kotlin',
  'swift',
  'scala',
  'perl',
  'spring boot',
  'spring',
  'django',
  'flask',
  'fastapi',
  'laravel',
  'express',
  'nestjs',
  'react',
  'angular',
  'vue',
  'svelte',
  'next.js',
  'nuxt',
  'node.js',
  'nodejs',
  'docker',
  'kubernetes',
  'k8s',
  'terraform',
  'ansible',
  'jenkins',
  'gitlab',
  'github actions',
  'aws',
  'azure',
  'gcp',
  'google cloud',
  'postgresql',
  'postgres',
  'mysql',
  'mongodb',
  'redis',
  'elasticsearch',
  'cassandra',
  'dynamodb',
  'kafka',
  'rabbitmq',
  'graphql',
  'grpc',
  'tensorflow',
  'pytorch',
  'scikit-learn',
  'pandas',
  'numpy',
  'selenium',
  'cypress',
  'jest',
  'junit',
  'mockito',
  'playwright',
  'jira',
  'confluence',
];

const findBorrowedTechTerms = (
  masterVocabulary: string,
  jobDescription: string,
  tailoredText: string
): string[] => {
  const masterLower = masterVocabulary.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  const tailoredLower = tailoredText.toLowerCase();

  return KNOWN_TECH_TERMS.filter(
    (term) =>
      tailoredLower.includes(term) &&
      jobLower.includes(term) &&
      !masterLower.includes(term)
  );
};

const TAILORED_CONTENT_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          title: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['company', 'title', 'bullets'],
      },
    },
  },
  required: ['summary', 'skills', 'experience'],
};

@injectable()
export class TailoredCvService {
  private static readonly MAX_ATTEMPTS = 3;

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

    const cleanedJobDescription = stripResidualHtml(jobDescription);
    const prompt = this.buildPrompt(
      masterCv,
      cleanedJobDescription,
      jobTitle,
      company
    );

    let lastError: unknown;
    for (
      let attempt = 1;
      attempt <= TailoredCvService.MAX_ATTEMPTS;
      attempt++
    ) {
      try {
        const content = await this.requestTailoredContent(
          prompt,
          apiKey,
          abortSignal
        );
        this.assertNotCorrupted(content);
        this.assertNoBorrowedTechTerms(
          masterCv,
          cleanedJobDescription,
          content
        );
        return this.mergeIntoMasterCv(masterCv, content);
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Tailored CV generation attempt ${attempt}/${TailoredCvService.MAX_ATTEMPTS} failed, ${attempt < TailoredCvService.MAX_ATTEMPTS ? 'retrying' : 'giving up'}`,
          error
        );
      }
    }

    throw lastError;
  }

  private buildPrompt(
    masterCv: MasterCv,
    jobDescription: string,
    jobTitle: string,
    company: string
  ): string {
    // Only summary/skills/experience are sent - contact info, dates, employers, and degrees
    // are objective facts the model never needs to see or reproduce.
    const tailorableSource = {
      summary: masterCv.summary,
      skills: masterCv.skills,
      experience: masterCv.experience.map((entry) => ({
        company: entry.company,
        title: entry.title,
        bullets: entry.bullets,
      })),
    };

    return [
      'You are tailoring a candidate CV for a specific job application.',
      "You are given the candidate's summary, skills, and experience bullets (their real, truthful data) as JSON, and a job description.",
      "Rewrite this content so it is targeted at the job: reprioritize and reorder skills and experience bullets, and rephrase wording to match the job description's terminology.",
      'Rules you MUST follow:',
      '- Never invent skills, employers, or job titles that are not present in the provided data.',
      '- The summary and experience bullets must not name or claim experience with any technology, tool, or skill that does not already appear in the "skills" list or in the original bullets. Do not borrow terminology from the job description unless the candidate already has the equivalent skill.',
      '- You may reword, reorder, and re-emphasize existing content, but every fact must remain truthful and traceable to the provided data.',
      '- Return every experience entry using the exact same "company" and "title" values you were given, unchanged, so they can be matched back up.',
      '- Return the full content, not just the parts you changed.',
      '',
      `Job title: ${jobTitle}`,
      `Company: ${company}`,
      'Job description:',
      jobDescription,
      '',
      'Candidate data:',
      JSON.stringify(tailorableSource),
    ].join('\n');
  }

  private async requestTailoredContent(
    prompt: string,
    apiKey: string,
    abortSignal?: AbortSignal
  ): Promise<TailoredCvContent> {
    const response =
      await this.restDataService.post<GeminiGenerateContentResponse>(
        `https://generativelanguage.googleapis.com/v1beta/models/${ConfigService.GEMINI_MODEL}:generateContent`,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: TAILORED_CONTENT_RESPONSE_SCHEMA,
            // This is a bounded rewrite task, not one needing extended reasoning;
            // "thinking" is what was driving multi-minute/hanging latency.
            thinkingConfig: { thinkingBudget: 0 },
          },
        },
        {
          searchParams: { key: apiKey },
          signal: abortSignal,
          // Gemini latency is highly variable even for identical, clean input (observed
          // anywhere from ~1s to 2+ minutes), so retry a slow attempt instead of just
          // waiting longer. RestDataService's default retry only covers GET, so this is
          // scoped to this call. `timeout` is per-attempt; `totalTimeout` bounds the
          // whole operation including retries.
          timeout: 45_000,
          totalTimeout: 120_000,
          retry: {
            limit: 2,
            methods: ['post'],
            retryOnTimeout: true,
          },
        }
      );

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      this.logger.error('Gemini returned no content', response);
      throw new Error('Gemini returned no tailored CV content.');
    }

    return JSON.parse(text) as TailoredCvContent;
  }

  private assertNotCorrupted(content: TailoredCvContent): void {
    const strings = [
      content.summary,
      ...content.skills,
      ...content.experience.flatMap((entry) => [
        entry.company,
        entry.title,
        ...entry.bullets,
      ]),
    ];

    if (strings.some(isSuspiciousText)) {
      throw new Error(
        'Gemini returned degenerate/corrupted output (repeated characters or runaway field length).'
      );
    }
  }

  // Unlike the skills array (a hard whitelist in reconcileSkills), summary/bullets are free
  // text and can't be validated the same way - this is a best-effort heuristic, not a
  // guarantee, scoped to named technologies specifically so it doesn't flag legitimate
  // tone/keyword matching against the job description.
  private assertNoBorrowedTechTerms(
    masterCv: MasterCv,
    jobDescription: string,
    content: TailoredCvContent
  ): void {
    const masterVocabulary = [
      masterCv.summary,
      ...masterCv.skills,
      ...masterCv.experience.flatMap((entry) => entry.bullets),
    ].join(' ');

    const tailoredText = [
      content.summary,
      ...content.experience.flatMap((entry) => entry.bullets),
    ].join(' ');

    const borrowed = findBorrowedTechTerms(
      masterVocabulary,
      jobDescription,
      tailoredText
    );

    if (borrowed.length > 0) {
      throw new Error(
        `Tailored content claims technologies not present in the master CV: ${borrowed.join(', ')}`
      );
    }
  }

  private mergeIntoMasterCv(
    masterCv: MasterCv,
    content: TailoredCvContent
  ): TailoredCv {
    return {
      ...masterCv,
      summary: content.summary,
      skills: this.reconcileSkills(masterCv.skills, content.skills),
      experience: masterCv.experience.map((original) => {
        const tailored = content.experience.find(
          (entry) =>
            entry.company === original.company && entry.title === original.title
        );
        return tailored ? { ...original, bullets: tailored.bullets } : original;
      }),
    };
  }

  // Skills are an enum-like list, unlike free-text bullets, so invented ones (a real
  // fabrication risk seen in practice) can be caught with a hard whitelist rather than
  // just hoping the "never invent" prompt instruction holds.
  private reconcileSkills(
    masterSkills: string[],
    tailoredSkills: string[]
  ): string[] {
    const allowedByLowercase = new Map(
      masterSkills.map((skill) => [skill.toLowerCase().trim(), skill])
    );

    const invented = tailoredSkills.filter(
      (skill) => !allowedByLowercase.has(skill.toLowerCase().trim())
    );
    if (invented.length > 0) {
      this.logger.warn(
        `Gemini invented skills not present in the master CV; dropping: ${invented.join(', ')}`
      );
    }

    const reconciled = tailoredSkills
      .map((skill) => allowedByLowercase.get(skill.toLowerCase().trim()))
      .filter((skill): skill is string => Boolean(skill));

    return reconciled.length > 0 ? reconciled : masterSkills;
  }
}
