import { TailoredCv } from '../../types/tailored-cv.ts';
import { escapeHtml, formatRange, headlineTitle } from '../shared.ts';

export function renderBoldHeaderBand(cv: TailoredCv): string {
  const contactItems = [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    ...(cv.contact.links ?? []),
  ]
    .filter((item): item is string => Boolean(item))
    .map((item) => `<span>${escapeHtml(item)}</span>`)
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

  const skillsHtml = cv.skills
    .map((skill) => `<span class="side-tag">${escapeHtml(skill)}</span>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #292524;
    font-size: 10.5pt;
    line-height: 1.45;
  }
  .band {
    position: fixed;
    top: 0; left: 0; right: 0;
    background: linear-gradient(120deg, #0F766E, #134E4A);
    color: #fff;
    padding: 14mm 18mm 10mm;
    font-family: "Trebuchet MS", "Century Gothic", sans-serif;
  }
  .band h1 { margin: 0; font-size: 25pt; letter-spacing: -0.01em; }
  .band .role { font-size: 12.5pt; color: #A9E4DC; margin-top: 4px; }
  .band .contact-row {
    margin-top: 10px; font-size: 9.5pt; color: #D8F3EE;
    display: flex; gap: 16px; flex-wrap: wrap;
  }
  .page-body {
    padding: 54mm 18mm 16mm;
    background: #FAF9F6;
    min-height: 297mm;
    display: grid;
    grid-template-columns: 63% 33%;
    gap: 4%;
  }
  h2.sec-label {
    color: #0D9488; font-size: 10pt; text-transform: uppercase;
    letter-spacing: 0.08em; margin: 0 0 8px;
  }
  .main section { margin-bottom: 18px; }
  .summary { margin: 0; }
  .item { margin-bottom: 14px; }
  .item-title { font-weight: 700; font-size: 11pt; }
  .item-meta {
    color: #78716C; font-size: 9pt; margin: 2px 0 6px;
    font-family: "Trebuchet MS", sans-serif;
  }
  ul { margin: 0; padding-left: 16px; }
  li { margin-bottom: 4px; }
  .side .block { margin-bottom: 16px; }
  .side-tag {
    display: inline-block; background: #E6F4F1; color: #0D9488;
    border-radius: 3px; padding: 3px 8px; margin: 0 4px 4px 0; font-size: 9pt;
  }
  .edu-item { margin-bottom: 10px; }
</style>
</head>
<body>
  <div class="band">
    <h1>${escapeHtml(cv.fullName)}</h1>
    <div class="role">${escapeHtml(headlineTitle(cv))}</div>
    <div class="contact-row">${contactItems}</div>
  </div>
  <div class="page-body">
    <div class="main">
      <section>
        <h2 class="sec-label">Summary</h2>
        <p class="summary">${escapeHtml(cv.summary)}</p>
      </section>
      <section>
        <h2 class="sec-label">Experience</h2>
        ${experienceHtml}
      </section>
    </div>
    <div class="side">
      <div class="block">
        <h2 class="sec-label">Skills</h2>
        ${skillsHtml}
      </div>
      <div class="block">
        <h2 class="sec-label">Education</h2>
        ${educationHtml}
      </div>
      ${
        cv.certifications?.length
          ? `<div class="block"><h2 class="sec-label">Certifications</h2><div>${cv.certifications.map((cert) => escapeHtml(cert)).join('<br>')}</div></div>`
          : ''
      }
      ${
        cv.languages?.length
          ? `<div class="block"><h2 class="sec-label">Languages</h2><div>${cv.languages.map((lang) => escapeHtml(lang)).join(', ')}</div></div>`
          : ''
      }
    </div>
  </div>
</body>
</html>`;
}
