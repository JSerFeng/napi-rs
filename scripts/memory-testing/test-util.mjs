import { __awaiter } from "tslib";
import { setTimeout } from 'timers';
import { promisify } from 'util';
import chalk from 'chalk';
import Dockerode from 'dockerode';
import prettyBytes from 'pretty-bytes';
const sleep = promisify(setTimeout);
const client = new Dockerode();
export function createSuite(testFile, maxMemoryUsage) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info(chalk.cyanBright('Create container'));
        const container = yield client.createContainer({
            Image: 'node:lts-slim',
            Cmd: ['/bin/bash', '-c', `node --expose-gc memory-testing/${testFile}.mjs`],
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            WorkingDir: '/napi-rs',
            Env: ['MAX_OLD_SPACE_SIZE=256', 'FORCE_COLOR=1'],
            HostConfig: {
                Binds: [`${process.cwd()}:/napi-rs:rw`],
                Memory: 256 * 1024 * 1024,
            },
        });
        console.info(chalk.cyanBright('Container created, starting ...'));
        yield container.start();
        container.attach({ stream: true, stdout: true, stderr: true }, function (err, stream) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            stream.pipe(process.stdout);
        });
        const stats = yield container.stats();
        let shouldAssertMemoryUsage = false;
        const initialMemoryUsage = yield new Promise((resolve, reject) => {
            stats.on('data', (d) => {
                var _a;
                const { memory_stats } = JSON.parse(d.toString('utf8'));
                resolve(memory_stats.usage);
                if (shouldAssertMemoryUsage && (memory_stats === null || memory_stats === void 0 ? void 0 : memory_stats.usage)) {
                    const memoryGrowth = memory_stats.usage - initialMemoryUsage;
                    if ((_a = memoryGrowth > maxMemoryUsage) !== null && _a !== void 0 ? _a : initialMemoryUsage) {
                        console.info(chalk.redBright(`Potential memory leak, memory growth: ${prettyBytes(memoryGrowth)}`));
                        process.exit(1);
                    }
                }
            });
            stats.on('error', reject);
        });
        console.info(chalk.red(`Initial memory usage: ${prettyBytes(initialMemoryUsage)}`));
        yield sleep(60000);
        shouldAssertMemoryUsage = true;
        yield container.stop();
        yield container.remove();
    });
}
//# sourceMappingURL=test-util.mjs.map