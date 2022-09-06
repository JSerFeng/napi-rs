import { Command } from 'clipanion';
export declare class ArtifactsCommand extends Command {
    static usage: import("clipanion").Usage;
    static paths: string[][];
    sourceDir: string;
    distDir: string;
    configFileName?: string;
    execute(): Promise<void>;
}
