import { container, inject, injectable } from 'tsyringe';
import { RestDataService } from '../rest/rest-data.service.ts';
import { SeekJobResolver } from '../resolvers/seek-job.resolver.ts';
import { SolidJobsResolver } from '../resolvers/seek-job/solid-jobs.resolver.ts';
import { ProtocolItResolver } from '../resolvers/seek-job/protocol-it.resolver.ts';
import { JustJoinItResolver } from '../resolvers/seek-job/just-join-it.resolver.ts';
import { NoFluffJobsResolver } from '../resolvers/seek-job/no-fluff-jobs.resolver.ts';

export type JobSeekSettings = {
  seekSources: string[];
  techstack: string[];
  sorting?: Sorting;
  workingMode?: WorkingMode;
  experienceLevel?: ExperienceLevel;
};

type Sorting = 'latest' | 'highest-salary' | 'lowest-salary';
type WorkingMode = 'remote' | 'hybrid' | 'office';
type ExperienceLevel = 'junior' | 'mid' | 'senior';

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
  ) {}

  async seekJobs(jobSeekSettings: JobSeekSettings): Promise<void> {
    const seekSources = jobSeekSettings.seekSources.filter((seekSource) =>
      SeekJobService.ALLOWED_SEEK_SOURCES.includes(seekSource)
    );

    const jobOffers = (
      await Promise.all(
        seekSources.map((seekSource) =>
          this.getSeekJobResolver(seekSource).resolve(jobSeekSettings)
        )
      )
    ).flat();

    console.log(jobOffers);
  }

  private getSeekJobResolver(seekSource: string): SeekJobResolver {
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
