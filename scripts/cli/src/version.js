import { __awaiter } from "tslib";
import { join } from 'path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { getNapiConfig } from './consts';
import { debugFactory } from './debug';
import { spawn } from './spawn';
import { updatePackageJson } from './update-package';
const debug = debugFactory('version');
export class VersionCommand extends Command {
    constructor() {
        super(...arguments);
        this.prefix = Option.String(`-p,--prefix`, 'npm');
        this.configFileName = Option.String('-c,--config');
    }
    static updatePackageJson(prefix, configFileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { version, platforms } = getNapiConfig(configFileName);
            for (const platformDetail of platforms) {
                const pkgDir = join(process.cwd(), prefix, platformDetail.platformArchABI);
                debug(`Update version to ${chalk.greenBright(version)} in [${chalk.yellowBright(pkgDir)}]`);
                yield updatePackageJson(join(pkgDir, 'package.json'), {
                    version,
                });
            }
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield VersionCommand.updatePackageJson(this.prefix, this.configFileName);
            yield spawn('git add .');
        });
    }
}
VersionCommand.usage = Command.Usage({
    description: 'Update versions in created npm dir',
});
VersionCommand.paths = [['version']];
//# sourceMappingURL=version.js.map