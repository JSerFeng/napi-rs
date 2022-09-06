"use strict";
const assert = require('assert');
const { readFileSync } = require('fs');
const { readFileAsync, callThreadsafeFunction, withAbortController, } = require('./index');
const FILE_CONTENT = readFileSync(__filename, 'utf8');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ctrl = new AbortController();
        const promise = withAbortController(1, 2, ctrl.signal);
        try {
            ctrl.abort();
            yield promise;
            throw new Error('Should throw AbortError');
        }
        catch (err) {
            assert(err.message === 'AbortError');
        }
        const buf = yield readFileAsync(__filename);
        assert(FILE_CONTENT === buf.toString('utf8'));
        const value = yield new Promise((resolve, reject) => {
            let i = 0;
            let value = 0;
            callThreadsafeFunction((err, v) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                i++;
                value += v;
                if (i === 100) {
                    resolve(value);
                }
            });
        });
        assert(value ===
            Array.from({ length: 100 }, (_, i) => i + 1).reduce((a, b) => a + b));
        process.exit(0);
    });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=electron.js.map