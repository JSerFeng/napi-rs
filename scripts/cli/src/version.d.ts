import { Command } from 'clipanion';
export declare class VersionCommand extends Command {
    static usage: import("clipanion").Usage;
    static paths: string[][];
    static updatePackageJson(prefix: string, configFileName?: string): Promise<void>;
    prefix: string;
    configFileName?: string;
    execute(): Promise<void>;
}
