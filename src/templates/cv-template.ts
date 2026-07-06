import { TailoredCv } from '../types/tailored-cv.ts';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const formatRange = (start?: string, end?: string): string => {
  if (!start && !end) return '';
  return `${start ?? ''} - ${end ?? 'Present'}`;
};

export function renderCvHtml(cv: TailoredCv): string {
  const links =
    cv.contact.links?.map((link) => escapeHtml(link)).join(' &middot; ') ?? '';
  const contactLine = [cv.contact.email, cv.contact.phone, cv.contact.location]
    .filter(Boolean)
    .map((part) => escapeHtml(part as string))
    .join(' &middot; ');

  const experienceHtml = cv.experience
    .map(
      (job) => `
        <section class="entry">
          <div class="entry-header">
            <span class="entry-title">${escapeHtml(job.title)} &mdash; ${escapeHtml(job.company)}</span>
            <span class="entry-dates">${escapeHtml(formatRange(job.startDate, job.endDate))}</span>
          </div>
          <ul>
            ${job.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
          </ul>
        </section>`
    )
    .join('');

  const educationHtml = cv.education
    .map(
      (edu) => `
        <section class="entry">
          <div class="entry-header">
            <span class="entry-title">${escapeHtml(edu.degree)} &mdash; ${escapeHtml(edu.institution)}</span>
            <span class="entry-dates">${escapeHtml(formatRange(edu.startDate, edu.endDate))}</span>
          </div>
        </section>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 40px; font-size: 11pt; }
  h1 { margin-bottom: 0; font-size: 20pt; }
  .contact { color: #444; margin-top: 4px; margin-bottom: 20px; font-size: 9.5pt; }
  h2 { font-size: 12pt; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-top: 22px; }
  .summary { line-height: 1.4; }
  .skills { line-height: 1.6; }
  .entry { margin-top: 12px; }
  .entry-header { display: flex; justify-content: space-between; font-weight: bold; }
  .entry-dates { font-weight: normal; color: #555; }
  ul { margin: 6px 0 0 0; padding-left: 18px; }
  li { margin-bottom: 3px; line-height: 1.35; }
</style>
</head>
<body>
  <h1>${escapeHtml(cv.fullName)}</h1>
  <div class="contact">${contactLine}${links ? ` &middot; ${links}` : ''}</div>

  <h2>Summary</h2>
  <p class="summary">${escapeHtml(cv.summary)}</p>

  <h2>Skills</h2>
  <p class="skills">${cv.skills.map((skill) => escapeHtml(skill)).join(', ')}</p>

  <h2>Experience</h2>
  ${experienceHtml}

  <h2>Education</h2>
  ${educationHtml}

  ${cv.certifications?.length ? `<h2>Certifications</h2><p>${cv.certifications.map((c) => escapeHtml(c)).join(', ')}</p>` : ''}
  ${cv.languages?.length ? `<h2>Languages</h2><p>${cv.languages.map((l) => escapeHtml(l)).join(', ')}</p>` : ''}
</body>
</html>`;
}
