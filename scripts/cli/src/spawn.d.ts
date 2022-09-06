/// <reference types="node" />
/// <reference types="node" />
import { SpawnOptionsWithoutStdio } from 'child_process';
export declare function spawn(command: string, options?: SpawnOptionsWithoutStdio): Promise<Buffer>;
