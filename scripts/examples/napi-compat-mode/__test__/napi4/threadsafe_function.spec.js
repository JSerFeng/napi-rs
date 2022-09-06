import { __awaiter } from "tslib";
import { execSync } from 'child_process';
import { join } from 'path';
import test from 'ava';
import { napiVersion } from '../napi-version';
const bindings = require('../../index.node');
test('should get js function called from a thread', (t) => __awaiter(void 0, void 0, void 0, function* () {
    let called = 0;
    if (napiVersion < 4) {
        t.is(bindings.testThreadsafeFunction, undefined);
        return;
    }
    yield new Promise((resolve, reject) => {
        bindings.testThreadsafeFunction((...args) => {
            called += 1;
            try {
                if (args[1] === 0) {
                    t.deepEqual(args, [null, 0, 1, 2, 3]);
                }
                else {
                    t.deepEqual(args, [null, 3, 2, 1, 0]);
                }
            }
            catch (err) {
                reject(err);
            }
            if (called === 2) {
                resolve();
            }
        });
    });
}));
test('should be able to abort tsfn', (t) => {
    if (napiVersion < 4) {
        t.is(bindings.testAbortThreadsafeFunction, undefined);
        return;
    }
    t.true(bindings.testAbortThreadsafeFunction(() => { }));
});
test('should be able to abort independent tsfn', (t) => {
    if (napiVersion < 4) {
        t.is(bindings.testAbortIndependentThreadsafeFunction, undefined);
        return;
    }
    t.false(bindings.testAbortIndependentThreadsafeFunction(() => { }));
});
test('should return Closing while calling aborted tsfn', (t) => {
    if (napiVersion < 4) {
        t.is(bindings.testCallAbortedThreadsafeFunction, undefined);
        return;
    }
    t.notThrows(() => bindings.testCallAbortedThreadsafeFunction(() => { }));
});
test('should work with napi ref', (t) => {
    if (napiVersion < 4) {
        t.is(bindings.testTsfnWithRef, undefined);
    }
    else {
        const obj = {
            foo: Symbol(),
        };
        return new Promise((resolve) => {
            bindings.testTsfnWithRef((err, returnObj) => {
                t.is(err, null);
                t.is(obj, returnObj);
                resolve();
            }, obj);
        });
    }
});
test('should be able to throw error in tsfn', (t) => {
    if (napiVersion < 4) {
        t.is(bindings.testThreadsafeFunction, undefined);
        return;
    }
    t.throws(() => {
        execSync(`node ${join(__dirname, 'tsfn-throw.js')}`);
    });
});
test('tsfn dua instance', (t) => {
    if (napiVersion < 4) {
        t.is(bindings.A, undefined);
        return;
    }
    t.notThrows(() => {
        execSync(`node ${join(__dirname, 'tsfn-dua-instance.js')}`);
    });
});
//# sourceMappingURL=threadsafe_function.spec.js.map