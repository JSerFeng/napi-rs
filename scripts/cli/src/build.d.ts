import { Command } from 'clipanion';
export declare class BuildCommand extends Command {
    static usage: import("clipanion").Usage;
    static paths: string[][];
    appendPlatformToFilename: boolean;
    isRelease: boolean;
    configFileName?: string;
    cargoName?: string;
    targetTripleDir: string;
    features?: string;
    bin?: string;
    dts?: string;
    noDtsHeader: boolean;
    project: string | undefined;
    cargoFlags: string;
    jsBinding: string;
    jsPackageName: string | undefined;
    cargoCwd?: string;
    pipe?: string;
    disableWindowsX32Optimize?: boolean;
    destDir: string | undefined;
    useZig: boolean;
    zigABIVersion: string | undefined;
    isStrip: boolean;
    execute(): Promise<void>;
}
