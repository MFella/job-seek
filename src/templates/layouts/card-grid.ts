import { TailoredCv } from '../../types/tailored-cv.ts';
import { escapeHtml, formatRange, headlineTitle } from '../shared.ts';

export function renderCardGrid(cv: TailoredCv): string {
  const contactLines = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    ...(cv.contact.links ?? []),
  ]
    .filter((item): item is string => Boolean(item))
    .map((item) => escapeHtml(item))
    .join('<br>');

  const skillsChips = cv.skills
    .map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`)
    .join('');

  const experienceCards = cv.experience
    .map(
      (job) => `
        <div class="card">
          <div class="item-title">${escapeHtml(job.title)} &mdash; ${escapeHtml(job.company)}</div>
          <div class="item-meta">${escapeHtml(formatRange(job.startDate, job.endDate))}</div>
          <ul>${job.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>
        </div>`
    )
    .join('');

  const educationCards = cv.education
    .map((edu) => {
      const range = formatRange(edu.startDate, edu.endDate);
      return `
        <div class="mini-card">
          <div class="mini-label">Education</div>
          <div class="item-title">${escapeHtml(edu.degree)}</div>
          <div class="item-meta">${escapeHtml(edu.institution)}${range ? ` &middot; ${escapeHtml(range)}` : ''}</div>
        </div>`;
    })
    .join('');

  const certsCard = cv.certifications?.length
    ? `<div class="mini-card">
        <div class="mini-label">Certifications</div>
        <div class="item-title">${cv.certifications.map((cert) => escapeHtml(cert)).join(', ')}</div>
      </div>`
    : '';

  const languagesCard = cv.languages?.length
    ? `<div class="mini-card">
        <div class="mini-label">Languages</div>
        <div class="item-title">${cv.languages.map((lang) => escapeHtml(lang)).join(', ')}</div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", system-ui, sans-serif;
    color: #1E1B2E;
    font-size: 10.5pt;
    line-height: 1.45;
    padding: 16mm 18mm;
  }
  .top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 18px;
  }
  h1 { margin: 0; font-size: 23pt; }
  .role { color: #6D28D9; font-size: 12pt; font-weight: 600; margin-top: 4px; }
  .contact-block { font-size: 9pt; color: #6B6875; text-align: right; line-height: 1.6; }
  h2.sec-label {
    font-size: 10pt; text-transform: uppercase; letter-spacing: 0.07em;
    margin: 0 0 8px;
  }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
  .chip {
    background: #F3E8FF; color: #6D28D9; border-radius: 999px;
    padding: 5px 12px; font-size: 9.5pt; font-weight: 600;
  }
  .card {
    border: 1px solid #EFEAF7; border-left: 3px solid #EC4899;
    border-radius: 5px; padding: 12px 14px; margin-bottom: 10px; background: #FDFCFE;
  }
  .card .item-title { font-weight: 700; font-size: 11pt; }
  .card .item-meta { color: #85808F; font-size: 9pt; margin: 3px 0 6px; }
  ul { margin: 0; padding-left: 16px; }
  li { margin-bottom: 4px; }
  .mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
  .mini-card { background: #FAF7FE; border-radius: 5px; padding: 10px 12px; }
  .mini-label {
    font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.07em;
    color: #6D28D9; margin-bottom: 4px;
  }
  .mini-card .item-title { font-size: 10.5pt; font-weight: 700; }
  .mini-card .item-meta { font-size: 9pt; color: #85808F; }
  .summary { margin: 0 0 20px; }
</style>
</head>
<body>
  <div class="top">
    <div>
      <h1>${escapeHtml(cv.fullName)}</h1>
      <div class="role">${escapeHtml(headlineTitle(cv))}</div>
    </div>
    <div class="contact-block">${contactLines}</div>
  </div>

  <h2 class="sec-label">Summary</h2>
  <p class="summary">${escapeHtml(cv.summary)}</p>

  <h2 class="sec-label">Skills</h2>
  <div class="chip-row">${skillsChips}</div>

  <h2 class="sec-label">Experience</h2>
  ${experienceCards}

  <div class="mini-grid">
    ${educationCards}
    ${certsCard}
    ${languagesCard}
  </div>
</body>
</html>`;
}
