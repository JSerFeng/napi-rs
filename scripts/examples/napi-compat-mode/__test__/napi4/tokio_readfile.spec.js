import { __awaiter } from "tslib";
import fs from 'fs';
import path from 'path';
import test from 'ava';
import { napiVersion } from '../napi-version';
const bindings = require('../../index.node');
const filepath = path.resolve(__dirname, './example.txt');
test('should read a file and return its a buffer', (t) => __awaiter(void 0, void 0, void 0, function* () {
    if (napiVersion < 4) {
        t.is(bindings.testTokioReadfile, undefined);
        return;
    }
    yield new Promise((resolve, reject) => {
        bindings.testTokioReadfile(filepath, (err, value) => {
            try {
                t.is(err, null);
                t.is(Buffer.isBuffer(value), true);
                t.is(value.toString(), fs.readFileSync(filepath, 'utf8'));
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    });
}));
//# sourceMappingURL=tokio_readfile.spec.js.map