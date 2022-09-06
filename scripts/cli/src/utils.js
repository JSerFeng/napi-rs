import { readFile, writeFile, copyFile, mkdir, unlink } from 'fs';
import { promisify } from 'util';
export const readFileAsync = promisify(readFile);
export const writeFileAsync = promisify(writeFile);
export const unlinkAsync = promisify(unlink);
export const copyFileAsync = promisify(copyFile);
export const mkdirAsync = promisify(mkdir);
export function pick(o, ...keys) {
    return keys.reduce((acc, key) => {
        acc[key] = o[key];
        return acc;
    }, {});
}
//# sourceMappingURL=utils.js.map