/// <reference types="node" />
import { readFile, writeFile, copyFile, mkdir, unlink } from 'fs';
export declare const readFileAsync: typeof readFile.__promisify__;
export declare const writeFileAsync: typeof writeFile.__promisify__;
export declare const unlinkAsync: typeof unlink.__promisify__;
export declare const copyFileAsync: typeof copyFile.__promisify__;
export declare const mkdirAsync: typeof mkdir.__promisify__;
export declare function pick<O, K extends keyof O>(o: O, ...keys: K[]): Pick<O, K>;
