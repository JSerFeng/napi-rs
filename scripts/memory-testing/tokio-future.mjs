import { __awaiter } from "tslib";
import { createRequire } from 'module';
import { displayMemoryUsageFromNode } from './util.mjs';
const initialMemoryUsage = process.memoryUsage();
const require = createRequire(import.meta.url);
const api = require(`./index.node`);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            yield api.testAsync();
            if (i % 100000 === 0) {
                displayMemoryUsageFromNode(initialMemoryUsage);
            }
            i++;
        }
    });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=tokio-future.mjs.map