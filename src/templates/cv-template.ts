import { TailoredCv } from '../types/tailored-cv.ts';
import { renderBoldHeaderBand } from './layouts/bold-header-band.ts';
import { renderCardGrid } from './layouts/card-grid.ts';
import { renderTwoToneSplit } from './layouts/two-tone-split.ts';

export type CvLayout = 'bold-header-band' | 'card-grid' | 'two-tone-split';

export const CV_LAYOUTS: {
  value: CvLayout;
  name: string;
  description: string;
}[] = [
  {
    value: 'bold-header-band',
    name: 'Bold Header Band',
    description: 'Full-width teal header, calm two-column body',
  },
  {
    value: 'card-grid',
    name: 'Card Grid',
    description: 'Violet & pink chips and bordered cards, most colorful',
  },
  {
    value: 'two-tone-split',
    name: 'Two-Tone Split',
    description: 'Bold plum & cream vertical split panel',
  },
];

export function renderCvHtml(cv: TailoredCv, layout: CvLayout): string {
  switch (layout) {
    case 'bold-header-band':
      return renderBoldHeaderBand(cv);
    case 'card-grid':
      return renderCardGrid(cv);
    case 'two-tone-split':
      return renderTwoToneSplit(cv);
  }
}
