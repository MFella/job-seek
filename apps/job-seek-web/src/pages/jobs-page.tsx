import { useEffect, useState } from 'react';
import { fetchJobOffers } from '../lib/api-client.ts';
import type { JobOffer } from '../types/job-offer.ts';

export function JobsPage() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>(
    'idle'
  );

  useEffect(() => {
    setStatus('loading');
    fetchJobOffers()
      .then((offers) => {
        setJobOffers(offers);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">Job offers</h1>
      <p className="mt-1 text-sm text-slate-500">
        Aggregated listings served by the job-seek-api backend.
      </p>

      {status === 'loading' && (
        <p className="mt-6 text-sm text-slate-500">Loading job offers…</p>
      )}

      {status === 'error' && (
        <p className="mt-6 text-sm text-red-600">
          Could not reach the API. Is job-seek-api running?
        </p>
      )}

      {status === 'ready' && jobOffers.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No job offers yet.</p>
      )}

      {status === 'ready' && jobOffers.length > 0 && (
        <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {jobOffers.map((offer) => (
            <li key={offer.id} className="px-4 py-3">
              <p className="font-medium text-slate-900">{offer.title}</p>
              <p className="text-sm text-slate-500">
                {offer.company} · {offer.location} · {offer.source}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
