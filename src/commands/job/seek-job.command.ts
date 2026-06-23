import { BaseCommand, NextCommandToExecute } from "../base-command.ts";
import { CommandConfigs, CommandKey } from "../../questions/questions.ts";
import { SeekJobService } from "../../services/seek-job.service.ts";
import { SeekSources } from "../../resolvers/seek-job.ts";
import { compile, HtmlToTextOptions } from "html-to-text";
import { select } from "@inquirer/prompts";
import { LoggerService } from "../../logger/logger.service.ts";
import open from "open";

const options: HtmlToTextOptions = {
    wordwrap: 130,
};

const compiledConvert = compile(options);

export class SeekJobCommand extends BaseCommand<'seek-job'> {
    private static readonly COMMAND_KEY: CommandKey = 'seek-job';


    constructor(
        protected readonly message: string,
        private readonly seekJobService: SeekJobService,
        private readonly logger: LoggerService
    ) {
        super(message, false);
    }

    getKey(): CommandKey {
        return SeekJobCommand.COMMAND_KEY;
    }

    async execute(config?: CommandConfigs['seek-job']): Promise<NextCommandToExecute[]> {
        this.logger.info(`Seeking job with config: ${JSON.stringify(config)}`);

        if (!config) {
            this.logger.warn("No config found. Skipping");
            return [{ commandKey: 'show-main-menu' }];
        }

        const seekedJob = await this.seekJobService.seekJob({
            seekSource: config.seekSource,
            slug: config.slug
        });

        this.logger.info(`Seeked job description:\n${compiledConvert(seekedJob.description)}`);

        const commandKey = await select<'go-back' | 'open-job-in-browser'>({
            message: 'Perform action on seeked job',
            choices: [
                { name: 'Open in browser', value: 'open-job-in-browser' },
                { name: 'Go back', value: 'go-back' },
            ],
        }, {
            signal: this.executionTerminationSignal,
        });

        if (commandKey === 'open-job-in-browser') {
            await open(seekedJob.url);
            return [];
        }

        return [{ commandKey, config: { commandKeyToRewind: 'seek-jobs' } }];
    }
}