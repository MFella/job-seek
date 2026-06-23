import { container, inject, injectable } from 'tsyringe';
import { RestDataService } from '../rest/rest-data.service.ts';
import { SeekJobResolver } from '../resolvers/seek-job.resolver.ts';
import { SolidJobsResolver } from '../resolvers/seek-job/solid-jobs.resolver.ts';
import { ProtocolItResolver } from '../resolvers/seek-job/protocol-it.resolver.ts';
import { JustJoinItResolver } from '../resolvers/seek-job/just-join-it.resolver.ts';
import { NoFluffJobsResolver } from '../resolvers/seek-job/no-fluff-jobs.resolver.ts';
import {
  DetailedJobOfferRaw,
  JobOfferRaw,
  SeekJobSettings,
  SeekSources,
  toSeekJobRequest,
  toSeekJobsRequest,
} from '../resolvers/seek-job.ts';

@injectable()
export class SeekJobService {
  private static readonly ALLOWED_SEEK_SOURCES = [
    'solid-jobs',
    'protocol-it',
    'just-join-it',
    'no-fluff-jobs',
  ];

  constructor(
    @inject(RestDataService) private readonly restDataService: RestDataService
  ) { }

  async seekJobs(
    jobSeekSettings: SeekJobSettings,
    abortSignal?: AbortSignal
  ): Promise<
    (Pick<
      JobOfferRaw<SeekSources>,
      'title' | 'company' | 'url' | 'postedAt' | 'id' | 'slug'
    > & Record<'seekSource', SeekSources>)[]
  > {
    const seekSourceNames = jobSeekSettings.seekSources
      .filter(
        (seekSource) =>
          SeekJobService.ALLOWED_SEEK_SOURCES.includes(seekSource.name) &&
          seekSource.mode === 'many'
      )
      .map(({ name }) => name);

    const jobOffers = (
      await Promise.all(
        seekSourceNames.map((seekSourceName) =>
          this.getSeekJobResolver(seekSourceName).resolveMany(
            toSeekJobsRequest(jobSeekSettings, seekSourceName), abortSignal
          )
        )
      )
    ).flat()

    return jobOffers;
  }

  async seekJob(jobSeekSettings: SeekJobSettings<"one">, abortSignal?: AbortSignal): Promise<DetailedJobOfferRaw<typeof jobSeekSettings.seekSource>> {
    const resolver = this.getSeekJobResolver(jobSeekSettings.seekSource);

    return await resolver.resolveOne(
      toSeekJobRequest(jobSeekSettings), abortSignal
    );
  }

  private getSeekJobResolver(seekSource: string): SeekJobResolver<SeekSources> {
    switch (seekSource) {
      case 'solid-jobs':
        return container.resolve(SolidJobsResolver);
      case 'protocol-it':
        return container.resolve(ProtocolItResolver);
      case 'just-join-it':
        return container.resolve(JustJoinItResolver);
      case 'no-fluff-jobs':
        return container.resolve(NoFluffJobsResolver);
      default:
        throw new Error(`Unknown seek source: ${seekSource}`);
    }
  }
}
