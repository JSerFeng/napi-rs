import { __awaiter } from "tslib";
import { join } from 'path';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import inquirer from 'inquirer';
import { load, dump } from 'js-yaml';
import { debugFactory } from './debug';
import { spawn } from './spawn';
import { readFileAsync, writeFileAsync } from './utils';
const debug = debugFactory('rename');
export class RenameCommand extends Command {
    constructor() {
        super(...arguments);
        this.name = Option.String('-n', {
            required: false,
            description: 'The new name of the project',
        });
        this.napiName = Option.String('--napi-name', {
            required: false,
            description: 'The new napi addon name',
        });
        this.repository = Option.String('--repository', {
            required: false,
            description: 'The repository of the package',
        });
        this.description = Option.String('-d,--description', {
            required: false,
            description: 'The description of the package',
        });
        this.cwd = Option.String({
            required: false,
            description: 'The working directory, default is [process.cwd()]',
        });
    }
    execute() {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const cwd = (_a = this.cwd) !== null && _a !== void 0 ? _a : process.cwd();
            const packageJson = yield readFileAsync(join(cwd, 'package.json'), 'utf8');
            const packageJsonData = JSON.parse(packageJson);
            const name = (_b = this.name) !== null && _b !== void 0 ? _b : (yield inquirer.prompt({
                name: 'name',
                type: 'input',
                suffix: chalk.dim(' name field in package.json'),
            })).name;
            const napiName = (_c = this.napiName) !== null && _c !== void 0 ? _c : (yield inquirer.prompt({
                name: 'napi name',
                type: 'input',
                default: name.split('/')[1],
            }))['napi name'];
            debug('name: %s, napi name: %s', name, napiName);
            packageJsonData.name = name;
            packageJsonData.napi.name = napiName;
            const repository = (_d = this.repository) !== null && _d !== void 0 ? _d : (yield inquirer.prompt({
                name: 'repository',
                type: 'input',
                suffix: chalk.dim(' Leave empty to skip'),
            })).repository;
            if (repository) {
                packageJsonData.repository = repository;
            }
            const description = (_e = this.description) !== null && _e !== void 0 ? _e : (yield inquirer.prompt({
                name: 'description',
                type: 'input',
                suffix: chalk.dim(' Leave empty to skip'),
            })).description;
            if (description) {
                packageJsonData.description = description;
            }
            yield writeFileAsync(join(cwd, 'package.json'), JSON.stringify(packageJsonData, null, 2));
            const CI = yield readFileAsync(join(cwd, '.github', 'workflows', 'CI.yml'), 'utf8');
            const CIObject = load(CI);
            CIObject.env.APP_NAME = napiName;
            yield writeFileAsync(join(cwd, '.github', 'workflows', 'CI.yml'), dump(CIObject, {
                lineWidth: 1000,
            }));
            let tomlContent = yield readFileAsync(join(cwd, 'Cargo.toml'), 'utf8');
            tomlContent = tomlContent.replace('name = "napi-package-template"', `name = "${napiName}"`);
            yield writeFileAsync(join(cwd, 'Cargo.toml'), tomlContent);
            yield spawn('napi create-npm-dir -t .');
        });
    }
}
RenameCommand.paths = [['rename']];
//# sourceMappingURL=rename.js.map