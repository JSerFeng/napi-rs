"use strict";
const bindings = require('../../index.node');
bindings.testThreadsafeFunction(() => {
    throw Error('Throw in thread safe function');
});
//# sourceMappingURL=tsfn-throw.js.map