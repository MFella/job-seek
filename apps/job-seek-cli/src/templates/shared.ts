import { TailoredCv } from '../types/tailored-cv.ts';

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const formatRange = (start?: string, end?: string): string => {
  if (!start && !end) return '';
  return `${start ?? ''} - ${end ?? 'Present'}`;
};

// The most recent job title doubles as the CV's headline, under the candidate's name.
export const headlineTitle = (cv: TailoredCv): string =>
  cv.experience[0]?.title ?? '';
