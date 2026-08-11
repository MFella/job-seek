import {
  JustJoinItDetailedJobOffer,
  JustJoinItJobApiResponse,
} from './just-join-it.ts';

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
  'just-join-it': JustJoinItDetailedJobOffer;
  'solid-jobs': Record<string, unknown>;
  'protocol-it': Record<string, unknown>;
  'no-fluff-jobs': Record<string, unknown>;
};

export type GetJobBoardSingleJobApiResponse<T extends SeekSources> =
  JobBoardSingleJobApiResponseMap[T];

export type GetJobBoardJobsApiResponse<T extends SeekSources> =
  JobBoardJobsApiResponseMap[T];

export type JobOfferRaw<T extends SeekSources> = {
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
  seekSource: T;
};

export type DetailedJobOfferRaw<T extends SeekSources> = JobOfferRaw<T> & {
  description: string;
};

export type SeekJobsRequest<T extends SeekSources> = Omit<
  SeekJobSettings,
  'seekSources'
> & {
  filters: (typeof seekJobsFilters)[T];
};

export type SeekJobRequest<T extends SeekSources> = Omit<
  SeekJobSettings<'one'>,
  'seekSource'
> &
  SeekJobParamsMap[T];

export type SeekSources =
  | 'just-join-it'
  | 'solid-jobs'
  | 'protocol-it'
  | 'no-fluff-jobs';

export type SeekSourceMode = 'one' | 'many';

export type SeekSource = {
  name: SeekSources;
  mode: SeekSourceMode;
};

export type SeekJobSettings<T extends SeekSourceMode = 'many'> =
  T extends 'many'
    ? {
        seekSources: SeekSource[];
        techstack: string[];
        sorting?: Sorting;
        workingMode?: WorkingMode;
        experienceLevel?: ExperienceLevel;
      }
    : T extends 'one'
      ? {
          seekSource: SeekSources;
          slug?: string;
        }
      : never;

export type SeekJobParamsMap = {
  'just-join-it': JustJoinItSeekJobParams;
  'solid-jobs': Record<string, unknown>;
  'protocol-it': Record<string, unknown>;
  'no-fluff-jobs': Record<string, unknown>;
};

type JustJoinItSeekJobParams = {
  slug?: string;
};

export function toSeekJobsRequest<T extends SeekSources>(
  seekJobSettings: SeekJobSettings,
  seekSource: T
): SeekJobsRequest<T> {
  return {
    ...seekJobSettings,
    filters: seekJobsFilters[seekSource],
  };
}

export function toSeekJobRequest<T extends SeekSources>(
  seekJobSettings: SeekJobSettings<'one'>
): SeekJobRequest<T> {
  return {
    ...seekJobSettings,
    slug: seekJobSettings.slug,
  };
}

const seekJobsFilters = {
  'just-join-it': { one: {}, many: {} },
  'solid-jobs': { one: {}, many: {} },
  'protocol-it': { one: {}, many: {} },
  'no-fluff-jobs': { one: {}, many: {} },
};
