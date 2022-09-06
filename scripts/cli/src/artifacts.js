import { __awaiter } from "tslib";
import { join, parse } from 'path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { fdir } from 'fdir';
import { getNapiConfig } from './consts';
import { debugFactory } from './debug';
import { readFileAsync, writeFileAsync } from './utils';
const debug = debugFactory('artifacts');
export class ArtifactsCommand extends Command {
    constructor() {
        super(...arguments);
        this.sourceDir = Option.String('-d,--dir', 'artifacts');
        this.distDir = Option.String('--dist', 'npm');
        this.configFileName = Option.String('-c,--config');
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const { platforms, binaryName, packageJsonPath } = getNapiConfig(this.configFileName);
            const packageJsonDir = parse(packageJsonPath).dir;
            const sourceApi = new fdir()
                .withFullPaths()
                .crawl(join(process.cwd(), this.sourceDir));
            const distDirs = platforms.map((platform) => join(process.cwd(), this.distDir, platform.platformArchABI));
            yield sourceApi.withPromise().then((output) => Promise.all(output.map((filePath) => __awaiter(this, void 0, void 0, function* () {
                debug(`Read [${chalk.yellowBright(filePath)}]`);
                const sourceContent = yield readFileAsync(filePath);
                const parsedName = parse(filePath);
                const [_binaryName, platformArchABI] = parsedName.name.split('.');
                if (_binaryName !== binaryName) {
                    debug(`[${chalk.yellowBright(_binaryName)}] is not matched with [${chalk.greenBright(binaryName)}], skip`);
                }
                const dir = distDirs.find((dir) => dir.includes(platformArchABI));
                if (!dir) {
                    throw new TypeError(`No dist dir found for ${filePath}`);
                }
                const distFilePath = join(dir, parsedName.base);
                debug(`Write file content to [${chalk.yellowBright(distFilePath)}]`);
                yield writeFileAsync(distFilePath, sourceContent);
                const distFilePathLocal = join(packageJsonDir, parsedName.base);
                debug(`Write file content to [${chalk.yellowBright(distFilePathLocal)}]`);
                yield writeFileAsync(distFilePathLocal, sourceContent);
            }))));
        });
    }
}
ArtifactsCommand.usage = Command.Usage({
    description: 'Copy artifacts from Github Actions into specified dir',
});
ArtifactsCommand.paths = [['artifacts']];
//# sourceMappingURL=artifacts.js.map