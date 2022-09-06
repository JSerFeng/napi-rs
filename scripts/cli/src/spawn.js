import { spawn as _spawn } from 'child_process';
import { debugFactory } from './debug';
const debug = debugFactory('spawn');
export function spawn(command, options = {}) {
    const [cmd, ...args] = command.split(' ').map((s) => s.trim());
    debug(`execute ${cmd} ${args.join(' ')}`);
    return new Promise((resolve, reject) => {
        var _a;
        const spawnStream = _spawn(cmd, args, Object.assign(Object.assign({}, options), { shell: true }));
        const chunks = [];
        process.stdin.pipe(spawnStream.stdin);
        (_a = spawnStream.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (chunk) => {
            chunks.push(chunk);
        });
        spawnStream.stdout.pipe(process.stdout);
        spawnStream.stderr.pipe(process.stderr);
        spawnStream.on('close', (code) => {
            if (code !== 0) {
                reject();
            }
            else {
                resolve(Buffer.concat(chunks));
            }
        });
    });
}
//# sourceMappingURL=spawn.js.map