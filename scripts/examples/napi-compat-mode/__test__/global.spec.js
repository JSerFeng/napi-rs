import { __awaiter } from "tslib";
import test from 'ava';
import Sinon from 'sinon';
const bindings = require('../index.node');
function wait(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
const delay = 100;
test('should setTimeout', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const handler = Sinon.spy();
    bindings.setTimeout(handler, delay);
    t.is(handler.callCount, 0);
    yield wait(delay + 10);
    t.is(handler.callCount, 1);
}));
test('should clearTimeout', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const handler = Sinon.spy();
    const timer = setTimeout(() => handler(), delay);
    t.is(handler.callCount, 0);
    bindings.clearTimeout(timer);
    yield wait(delay + 10);
    t.is(handler.callCount, 0);
}));
//# sourceMappingURL=global.spec.js.map