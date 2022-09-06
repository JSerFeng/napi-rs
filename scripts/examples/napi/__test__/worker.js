"use strict";
const { parentPort } = require('worker_threads');
const native = require('../index');
parentPort.postMessage(native.Animal.withKind(1 /* native.Kind.Cat */).whoami() + native.DEFAULT_COST);
//# sourceMappingURL=worker.js.map