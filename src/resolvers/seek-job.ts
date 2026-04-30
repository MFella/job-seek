import { JustJoinItJobApiResponse } from './just-join-it.ts';

export type JobBoard = 'justjoinit' | 'solid' | 'protocol' | 'nofluff';

export type JobBoardApiResponseMap = {
  justjoinit: JustJoinItJobApiResponse;
  solid: Record<string, unknown>;
  protocol: Record<string, unknown>;
  nofluff: Record<string, unknown>;
};

export type GetJobBoardJobsApiResponse<T extends JobBoard> =
  JobBoardApiResponseMap[T];

export type JobOfferRaw = {
  id: string;
  title: string;
  company: string;
  salaryFrom?: number;
  salaryTo?: number;
  currency?: string;
  workingMode?: string;
  experienceLevel?: string;
  location?: string;
  url: string;
  description?: string;
  postedAt?: string;
};

export type SeekJobRequest = {
  techstack: string[];
  sorting?: Sorting;
  workingMode?: WorkingMode;
  experienceLevel?: ExperienceLevel;
};
