import { Command } from 'clipanion';
export declare class NewProjectCommand extends Command {
    static usage: import("clipanion").Usage;
    static paths: string[][];
    name?: string;
    dirname?: string;
    targets?: string[];
    dryRun: boolean;
    enableGithubActions?: boolean;
    execute(): Promise<void>;
    private writeFile;
    private getName;
}
