"use strict";
const bindings = require('../../index.node');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.resolve();
        new bindings.A((s) => console.info(s));
        new bindings.A((s) => console.info(s));
    });
}
main().catch((e) => {
    console.error(e);
});
//# sourceMappingURL=tsfn-dua-instance.js.map