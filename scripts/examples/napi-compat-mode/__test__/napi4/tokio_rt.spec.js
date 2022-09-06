import { __awaiter } from "tslib";
import { readFileSync } from 'fs';
import { join } from 'path';
import test from 'ava';
import { napiVersion } from '../napi-version';
const bindings = require('../../index.node');
const filepath = join(__dirname, './example.txt');
test.serial('should execute future on tokio runtime', (t) => __awaiter(void 0, void 0, void 0, function* () {
    if (napiVersion < 4) {
        t.is(bindings.testExecuteTokioReadfile, undefined);
        return;
    }
    const fileContent = yield bindings.testExecuteTokioReadfile(filepath);
    t.true(Buffer.isBuffer(fileContent));
    t.deepEqual(readFileSync(filepath), fileContent);
}));
test.serial('should reject error from tokio future', (t) => __awaiter(void 0, void 0, void 0, function* () {
    if (napiVersion < 4) {
        t.is(bindings.testTokioError, undefined);
        return;
    }
    try {
        yield bindings.testTokioError(filepath);
        throw new TypeError('Unreachable');
    }
    catch (e) {
        t.is(e.message, 'Error from tokio future');
    }
}));
test.serial('should be able to execute future paralleled', (t) => __awaiter(void 0, void 0, void 0, function* () {
    if (napiVersion < 4) {
        t.is(bindings.testExecuteTokioReadfile, undefined);
        return;
    }
    const buffers = yield Promise.all(Array.from({ length: 50 }).map((_) => bindings.testExecuteTokioReadfile(filepath)));
    for (const fileContent of buffers) {
        t.true(Buffer.isBuffer(fileContent));
        t.deepEqual(readFileSync(filepath), fileContent);
    }
}));
//# sourceMappingURL=tokio_rt.spec.js.map