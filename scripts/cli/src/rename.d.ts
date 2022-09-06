import { Command } from 'clipanion';
export declare class RenameCommand extends Command {
    static paths: string[][];
    name: string | undefined;
    napiName: string | undefined;
    repository: string | undefined;
    description: string | undefined;
    cwd: string | undefined;
    execute(): Promise<void>;
}
