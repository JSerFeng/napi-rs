import { __awaiter } from "tslib";
import { join } from 'path';
import { Worker } from 'worker_threads';
import test from 'ava';
import { Animal, DEFAULT_COST } from '../index';
test('should be able to require in worker thread', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(Array.from({ length: 100 }).map(() => {
        const w = new Worker(join(__dirname, 'worker.js'));
        return new Promise((resolve, reject) => {
            w.on('message', (msg) => {
                t.is(msg, Animal.withKind(1 /* Kind.Cat */).whoami() + DEFAULT_COST);
                resolve();
            });
            w.on('error', (err) => {
                reject(err);
            });
        })
            .then(() => w.terminate())
            .then(() => {
            t.pass();
        });
    }));
}));
//# sourceMappingURL=worker-thread.spec.js.map