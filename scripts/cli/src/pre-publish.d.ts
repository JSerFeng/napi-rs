import { Command } from 'clipanion';
export declare class PrePublishCommand extends Command {
    static usage: import("clipanion").Usage;
    static paths: string[][];
    prefix: string;
    tagStyle: 'npm' | 'lerna';
    configFileName?: string;
    isDryRun: boolean;
    skipGHRelease: boolean;
    ghReleaseName?: string;
    existingReleaseId?: string;
    execute(): Promise<void>;
    private createGhRelease;
    private getRepoInfo;
    private parseTag;
}
