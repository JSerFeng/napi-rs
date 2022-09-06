import { Command } from 'clipanion';
export declare class CreateNpmDirCommand extends Command {
    static usage: import("clipanion").Usage;
    static paths: string[][];
    static create: (config: string, targetDirPath: string, cwd: string) => Promise<void>;
    targetDir: string;
    config: string;
    execute(): Promise<void>;
}
