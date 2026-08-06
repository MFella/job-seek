import type { JobOffer } from '../types/job-offer.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchJobOffers(): Promise<JobOffer[]> {
  const response = await fetch(`${API_BASE_URL}/job-offers`);

  if (!response.ok) {
    throw new Error(`Failed to fetch job offers: ${response.status}`);
  }

  return response.json();
}
