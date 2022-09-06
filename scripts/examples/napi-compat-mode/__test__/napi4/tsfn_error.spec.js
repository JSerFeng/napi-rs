import { __awaiter } from "tslib";
import test from 'ava';
import { napiVersion } from '../napi-version';
const bindings = require('../../index.node');
test('should call callback with the first arguments as an Error', (t) => __awaiter(void 0, void 0, void 0, function* () {
    if (napiVersion < 4) {
        t.is(bindings.testTsfnError, undefined);
        return;
    }
    yield new Promise((resolve, reject) => {
        bindings.testTsfnError((err) => {
            try {
                t.is(err instanceof Error, true);
                t.is(err.message, 'invalid');
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });
}));
//# sourceMappingURL=tsfn_error.spec.js.map