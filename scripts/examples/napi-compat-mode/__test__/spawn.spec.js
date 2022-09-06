import { __awaiter } from "tslib";
import test from 'ava';
const bindings = require('../index.node');
test('should be able to spawn thread and return promise', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bindings.testSpawnThread(20);
    t.is(result, 6765);
}));
test('should be able to spawn thread with ref value', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fixture = 'hello';
    const result = yield bindings.testSpawnThreadWithRef(Buffer.from(fixture));
    t.is(result, fixture.length);
}));
test('should be able to spawn with error', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fixture = Array.from({ length: 10 }).fill('0').join('');
    const err = new Error('Unreachable');
    try {
        yield bindings.testSpawnThreadWithRef(Buffer.from(fixture));
        throw err;
    }
    catch (e) {
        t.not(e, err);
    }
}));
//# sourceMappingURL=spawn.spec.js.map