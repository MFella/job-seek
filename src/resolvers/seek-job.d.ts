export type JobOfferRaw = {
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
