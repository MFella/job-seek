import { JustJoinItJobApiResponse } from './just-join-it.ts';

type Sorting = 'latest' | 'highest-salary' | 'lowest-salary';
type WorkingMode = 'remote' | 'hybrid' | 'office';
type ExperienceLevel = 'junior' | 'mid' | 'senior';

export type JobBoardJobsApiResponseMap = {
  'just-join-it': JustJoinItJobApiResponse;
  'solid-jobs': Record<string, unknown>;
  'protocol-it': Record<string, unknown>;
  'no-fluff-jobs': Record<string, unknown>;
};

export type JobBoardSingleJobApiResponseMap = {
  'just-join-it': JustJoinItJobApiResponse['data'][0];
  'solid-jobs': Record<string, unknown>;
  'protocol-it': Record<string, unknown>;
  'no-fluff-jobs': Record<string, unknown>;
};

export type GetJobBoardSingleJobApiResponse<T extends SeekSources> =
  JobBoardSingleJobApiResponseMap[T];

export type GetJobBoardJobsApiResponse<T extends SeekSources> =
  JobBoardJobsApiResponseMap[T];

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
  slug?: string;
};

export type SeekJobRequest<T extends SeekSources> = Omit<
  SeekJobSettings,
  'seekSources'
> & {
  filters: (typeof seekJobFilters)[T];
};

export type SeekSources =
  | 'just-join-it'
  | 'solid-jobs'
  | 'protocol-it'
  | 'no-fluff-jobs';

export type SeekSource = {
  name: SeekSources;
  mode: 'one' | 'many';
};

export type SeekJobSettings = {
  seekSources: SeekSource[];
  techstack: string[];
  sorting?: Sorting;
  workingMode?: WorkingMode;
  experienceLevel?: ExperienceLevel;
};

export function toSeekJobRequest<T extends SeekSources>(
  seekJobSettings: SeekJobSettings,
  seekSource: T
): SeekJobRequest<T> {
  return {
    ...seekJobSettings,
    filters: seekJobFilters[seekSource],
  };
}

const seekJobFilters = {
  'just-join-it': {},
  'solid-jobs': {},
  'protocol-it': {},
  'no-fluff-jobs': {},
};
