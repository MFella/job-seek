import type { JobOfferRaw, SeekJobRequest } from './seek-job.d.ts';

export abstract class SeekJobResolver {
  abstract resolve(seekJobRequest: SeekJobRequest): Promise<JobOfferRaw[]>;
}
