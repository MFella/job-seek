import { TailoredCv } from '../../types/tailored-cv.ts';
import { escapeHtml, formatRange, headlineTitle } from '../shared.ts';

export function renderTwoToneSplit(cv: TailoredCv): string {
  const contactLines = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    ...(cv.contact.links ?? []),
  ]
    .filter((item): item is string => Boolean(item))
    .map((item) => `<div class="contact-line">${escapeHtml(item)}</div>`)
    .join('');

  const skillLines = cv.skills
    .map((skill) => `<div class="skill-line">${escapeHtml(skill)}</div>`)
    .join('');

  const experienceHtml = cv.experience
    .map(
      (job) => `
        <div class="item">
          <div class="item-title">${escapeHtml(job.title)} &mdash; ${escapeHtml(job.company)}</div>
          <div class="item-meta">${escapeHtml(formatRange(job.startDate, job.endDate))}</div>
          <ul>${job.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>
        </div>`
    )
    .join('');

  const educationHtml = cv.education
    .map((edu) => {
      const range = formatRange(edu.startDate, edu.endDate);
      return `
        <div class="edu-item">
          <div class="item-title">${escapeHtml(edu.degree)}</div>
          <div class="item-meta">${escapeHtml(edu.institution)}${range ? ` &middot; ${escapeHtml(range)}` : ''}</div>
        </div>`;
    })
    .join('');

  const certsSection = cv.certifications?.length
    ? `<section><h2 class="sec-label on-cream">Certifications</h2><div>${cv.certifications.map((cert) => escapeHtml(cert)).join(', ')}</div></section>`
    : '';

  const languagesSection = cv.languages?.length
    ? `<section><h2 class="sec-label on-cream">Languages</h2><div>${cv.languages.map((lang) => escapeHtml(lang)).join(', ')}</div></section>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-size: 10.5pt; line-height: 1.5; color: #292524; }
  .panel {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 70mm;
    background: #3B0764;
    color: #F3E8FF;
    padding: 16mm 12mm;
    font-family: Georgia, serif;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }
  .panel h1 { margin: 0; font-size: 21pt; color: #fff; line-height: 1.2; }
  .panel .role { color: #D6B4F0; font-size: 11pt; margin-top: 6px; }
  .panel h2.sec-label {
    color: #D6B4F0; font-size: 9pt; text-transform: uppercase;
    letter-spacing: 0.07em; margin: 0 0 8px;
  }
  .panel .contact-line { font-size: 9.5pt; color: #E4D3F5; margin-bottom: 5px; word-break: break-word; }
  .panel .skill-line {
    font-size: 10pt; border-bottom: 1px solid rgba(255,255,255,0.18);
    padding-bottom: 6px; margin-bottom: 6px; color: #EFE2FA;
  }
  .panel .skill-line:last-child { border-bottom: none; }
  .content {
    margin-left: 70mm;
    background: #FFF7ED;
    min-height: 297mm;
    padding: 16mm 14mm;
    font-family: "Segoe UI", system-ui, sans-serif;
  }
  h2.sec-label.on-cream {
    color: #9333EA; font-size: 10pt; text-transform: uppercase;
    letter-spacing: 0.07em; margin: 0 0 8px;
  }
  .content section { margin-bottom: 18px; }
  .item { margin-bottom: 14px; }
  .item-title { font-weight: 700; font-size: 11pt; }
  .item-meta { color: #78716C; font-size: 9pt; margin: 2px 0 6px; }
  .edu-item { margin-bottom: 10px; }
  ul { margin: 0; padding-left: 16px; }
  li { margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="panel">
    <div>
      <h1>${escapeHtml(cv.fullName)}</h1>
      <div class="role">${escapeHtml(headlineTitle(cv))}</div>
    </div>
    <div>
      <h2 class="sec-label">Contact</h2>
      ${contactLines}
    </div>
    <div>
      <h2 class="sec-label">Skills</h2>
      ${skillLines}
    </div>
  </div>
  <div class="content">
    <section>
      <h2 class="sec-label on-cream">Summary</h2>
      <div>${escapeHtml(cv.summary)}</div>
    </section>
    <section>
      <h2 class="sec-label on-cream">Experience</h2>
      ${experienceHtml}
    </section>
    <section>
      <h2 class="sec-label on-cream">Education</h2>
      ${educationHtml}
    </section>
    ${certsSection}
    ${languagesSection}
  </div>
</body>
</html>`;
}
