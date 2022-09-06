import { __awaiter } from "tslib";
import { writeFileAsync } from './utils';
export function updatePackageJson(path, partial) {
    return __awaiter(this, void 0, void 0, function* () {
        const old = require(path);
        yield writeFileAsync(path, JSON.stringify(Object.assign(Object.assign({}, old), partial), null, 2));
    });
}
//# sourceMappingURL=update-package.js.map