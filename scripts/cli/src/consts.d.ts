import { PlatformDetail } from './parse-triple';
export declare function getNapiConfig(packageJson?: string, cwd?: string): {
    platforms: PlatformDetail[];
    version: any;
    packageName: any;
    binaryName: string;
    packageJsonPath: string;
    content: any;
    npmClient: string;
};
