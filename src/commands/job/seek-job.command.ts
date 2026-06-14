import { BaseCommand, NextCommandToExecute } from "../base-command.ts";
import { CommandKey } from "../../questions/questions.ts";
import { SeekJobService } from "../../services/seek-job.service.ts";
import { SeekSources } from "../../resolvers/seek-job.ts";
import { compile, HtmlToTextOptions } from "html-to-text";

type SeekJobCommandConfig = {
    seekSource: SeekSources;
    slug?: string;
};

const options: HtmlToTextOptions = {
    wordwrap: 130,
};

const compiledConvert = compile(options);

export class SeekJobCommand extends BaseCommand {
    private static readonly COMMAND_KEY: CommandKey = 'seek-job';


    constructor(
        protected readonly message: string,
        private readonly seekJobService: SeekJobService
    ) {
        super(message, true);
    }

    getKey(): CommandKey {
        return SeekJobCommand.COMMAND_KEY;
    }

    async execute(config?: SeekJobCommandConfig): Promise<NextCommandToExecute[]> {
        // TODO: Use logger instead of console.log
        console.log('Seeking job with config: ', config);

        if (!config) {
            console.log("No config found. Skipping");
            return [{ commandKey: 'show-main-menu' }];
        }

        const seekedJob = await this.seekJobService.seekJob({
            seekSource: config.seekSource,
            slug: config.slug
        });

        // TODO: Adjust display of that
        console.log('Seeked job description', compiledConvert(seekedJob.description));
        return [{ commandKey: 'show-main-menu' }];
    }
}