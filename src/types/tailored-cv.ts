export type CvContact = {
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
};

export type CvExperience = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
};

export type CvEducation = {
  institution: string;
  degree: string;
  startDate?: string;
  endDate?: string;
};

// Candidate's raw, truthful data. This is the source of truth the AI must not contradict.
export type MasterCv = {
  fullName: string;
  contact: CvContact;
  summary: string;
  skills: string[];
  experience: CvExperience[];
  education: CvEducation[];
  certifications?: string[];
  languages?: string[];
};

// Same shape, produced by the AI: reworded/reordered/re-prioritized, never fabricated.
export type TailoredCv = MasterCv;
