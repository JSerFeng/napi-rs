import { __awaiter } from "tslib";
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, parse, sep } from 'path';
import { Instance } from 'chalk';
import { Command, Option } from 'clipanion';
import envPaths from 'env-paths';
import { groupBy } from 'lodash-es';
import toml from 'toml';
import { getNapiConfig } from './consts';
import { debugFactory } from './debug';
import { createJsBinding } from './js-binding-template';
import { getHostTargetTriple, parseTriple } from './parse-triple';
import { copyFileAsync, mkdirAsync, readFileAsync, unlinkAsync, writeFileAsync, } from './utils';
const debug = debugFactory('build');
const chalk = new Instance({ level: 1 });
const ZIG_PLATFORM_TARGET_MAP = {
    'x86_64-unknown-linux-musl': 'x86_64-linux-musl',
    'x86_64-unknown-linux-gnu': 'x86_64-linux-gnu',
    // Doesn't support Windows MSVC for now
    // 'x86_64-pc-windows-gnu': 'x86_64-windows-gnu',
    // https://github.com/ziglang/zig/issues/1759
    // 'x86_64-unknown-freebsd': 'x86_64-freebsd',
    'x86_64-apple-darwin': 'x86_64-macos-gnu',
    'aarch64-apple-darwin': 'aarch64-macos',
    'aarch64-unknown-linux-gnu': 'aarch64-linux-gnu',
    'aarch64-unknown-linux-musl': 'aarch64-linux-musl',
};
function processZigLinkerArgs(platform, args) {
    if (platform.includes('apple')) {
        const newArgs = args.filter((arg, index) => !arg.startsWith('-Wl,-exported_symbols_list') &&
            arg !== '-Wl,-dylib' &&
            arg !== '-liconv' &&
            arg !== '-Wl,-dead_strip' &&
            !(arg === '-framework' && args[index + 1] === 'CoreFoundation') &&
            !(arg === 'CoreFoundation' && args[index - 1] === '-framework'));
        newArgs.push('-Wl,"-undefined=dynamic_lookup"', '-dead_strip', '-lunwind');
        return newArgs;
    }
    if (platform.includes('linux')) {
        return args.map((arg) => {
            if (arg === '-lgcc_s') {
                return '-lunwind';
            }
            return arg;
        });
    }
    return args;
}
export class BuildCommand extends Command {
    constructor() {
        var _a, _b;
        super(...arguments);
        this.appendPlatformToFilename = Option.Boolean(`--platform`, false, {
            description: `Add platform triple to the .node file. ${chalk.green('[name].linux-x64-gnu.node')} for example`,
        });
        this.isRelease = Option.Boolean(`--release`, false, {
            description: `Bypass to ${chalk.green('cargo build --release')}`,
        });
        this.configFileName = Option.String('--config,-c', {
            description: `napi config path, only JSON format accepted. Default to ${chalk.underline(chalk.green('package.json'))}`,
        });
        this.cargoName = Option.String('--cargo-name', {
            description: `Override the ${chalk.green('name')} field in ${chalk.underline(chalk.yellowBright('Cargo.toml'))}`,
        });
        this.targetTripleDir = Option.String('--target', (_b = (_a = process.env.RUST_TARGET) !== null && _a !== void 0 ? _a : process.env.CARGO_BUILD_TARGET) !== null && _b !== void 0 ? _b : '', {
            description: `Bypass to ${chalk.green('cargo build --target')}`,
        });
        this.features = Option.String('--features', {
            description: `Bypass to ${chalk.green('cargo build --features')}`,
        });
        this.bin = Option.String('--bin', {
            description: `Bypass to ${chalk.green('cargo build --bin')}`,
        });
        this.dts = Option.String('--dts', 'index.d.ts', {
            description: `The filename and path of ${chalk.green('.d.ts')} file, relative to cwd`,
        });
        this.noDtsHeader = Option.Boolean('--no-dts-header', false, {
            description: `Don't generate ${chalk.green('.d.ts')} header`,
        });
        this.project = Option.String('-p', {
            description: `Bypass to ${chalk.green('cargo -p')}`,
        });
        this.cargoFlags = Option.String('--cargo-flags', '', {
            description: `All the others flag passed to ${chalk.yellow('cargo build')}`,
        });
        this.jsBinding = Option.String('--js', 'index.js', {
            description: `Path to the JS binding file, pass ${chalk.underline(chalk.yellow('false'))} to disable it. Only affect if ${chalk.green('--target')} is specified.`,
        });
        this.jsPackageName = Option.String('--js-package-name', {
            description: `Package name in generated js binding file, Only affect if ${chalk.green('--target')} specified and ${chalk.green('--js')} is not false.`,
            required: false,
        });
        this.cargoCwd = Option.String('--cargo-cwd', {
            description: `The cwd of ${chalk.underline(chalk.yellow('Cargo.toml'))} file`,
        });
        this.pipe = Option.String('--pipe', {
            description: `Pipe [${chalk.green('.js/.ts')}] files to this command, eg ${chalk.green('prettier -w')}`,
        });
        // https://github.com/napi-rs/napi-rs/issues/297
        this.disableWindowsX32Optimize = Option.Boolean('--disable-windows-x32-optimize', false, {
            description: `Disable windows x32 ${chalk.green('lto')} and increase ${chalk.green('codegen-units')}. Enabled by default. See ${chalk.underline.blue('https://github.com/napi-rs/napi-rs/issues/297')}`,
        });
        this.destDir = Option.String({
            required: false,
        });
        this.useZig = Option.Boolean(`--zig`, false, {
            description: `Use ${chalk.green('zig')} as linker ${chalk.yellowBright('(Experimental)')}`,
        });
        this.zigABIVersion = Option.String(`--zig-abi-suffix`, {
            description: `The suffix of the ${chalk.green('zig --target')} ABI version. Eg. ${chalk.cyan('--target x86_64-unknown-linux-gnu')} ${chalk.green('--zig-abi-suffix=2.17')}`,
        });
        this.isStrip = Option.Boolean(`--strip`, false, {
            description: `${chalk.green('Strip')} the library for minimum file size`,
        });
    }
    execute() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            const cwd = this.cargoCwd
                ? join(process.cwd(), this.cargoCwd)
                : process.cwd();
            let tomlContentString;
            let tomlContent;
            try {
                debug('Start read toml');
                tomlContentString = yield readFileAsync(join(cwd, 'Cargo.toml'), 'utf-8');
            }
            catch (_l) {
                throw new TypeError(`Could not find Cargo.toml in ${cwd}`);
            }
            try {
                debug('Start parse toml');
                tomlContent = toml.parse(tomlContentString);
            }
            catch (_m) {
                throw new TypeError('Could not parse the Cargo.toml');
            }
            let cargoPackageName;
            if ((_a = tomlContent.package) === null || _a === void 0 ? void 0 : _a.name) {
                cargoPackageName = tomlContent.package.name;
            }
            else if (this.cargoName) {
                cargoPackageName = this.cargoName;
            }
            else {
                throw new TypeError('No package.name field in Cargo.toml');
            }
            const cargoMetadata = JSON.parse(execSync('cargo metadata --format-version 1', {
                stdio: 'pipe',
                maxBuffer: 1024 * 1024 * 10,
            }).toString('utf8'));
            const packages = cargoMetadata.packages;
            const cargoPackage = packages.find((p) => p.name === cargoPackageName);
            if (!this.bin &&
                ((_b = cargoPackage === null || cargoPackage === void 0 ? void 0 : cargoPackage.targets) === null || _b === void 0 ? void 0 : _b.length) === 1 &&
                (cargoPackage === null || cargoPackage === void 0 ? void 0 : cargoPackage.targets[0].kind.length) === 1 &&
                (cargoPackage === null || cargoPackage === void 0 ? void 0 : cargoPackage.targets[0].kind[0]) === 'bin') {
                this.bin = cargoPackageName;
            }
            const releaseFlag = this.isRelease ? `--release` : '';
            const targetFlag = this.targetTripleDir
                ? `--target ${this.targetTripleDir}`
                : '';
            const featuresFlag = this.features ? `--features ${this.features}` : '';
            const binFlag = this.bin ? `--bin ${this.bin}` : '';
            const triple = this.targetTripleDir
                ? parseTriple(this.targetTripleDir)
                : getHostTargetTriple();
            debug(`Current triple is: ${chalk.green(triple.raw)}`);
            const pFlag = this.project ? `-p ${this.project}` : '';
            const externalFlags = [
                releaseFlag,
                targetFlag,
                featuresFlag,
                binFlag,
                pFlag,
                this.cargoFlags,
            ]
                .filter((flag) => Boolean(flag))
                .join(' ');
            const cargo = (_c = process.env.CARGO) !== null && _c !== void 0 ? _c : 'cargo';
            const cargoCommand = `${cargo} build ${externalFlags}`;
            const intermediateTypeFile = join(tmpdir(), `type_def.${Date.now()}.tmp`);
            debug(`Run ${chalk.green(cargoCommand)}`);
            const additionalEnv = {};
            const rustflags = process.env.RUSTFLAGS
                ? process.env.RUSTFLAGS.split(' ')
                : [];
            if (triple.raw.includes('musl') && !this.bin) {
                if (!rustflags.includes('target-feature=-crt-static')) {
                    rustflags.push('-C target-feature=-crt-static');
                }
            }
            if (this.isStrip && !rustflags.includes('-C link-arg=-s')) {
                rustflags.push('-C link-arg=-s');
            }
            if (rustflags.length > 0) {
                additionalEnv['RUSTFLAGS'] = rustflags.join(' ');
            }
            if (this.useZig) {
                const zigTarget = `${ZIG_PLATFORM_TARGET_MAP[triple.raw]}${this.zigABIVersion ? `.${this.zigABIVersion}` : ''}`;
                if (!zigTarget) {
                    throw new Error(`${triple.raw} can not be cross compiled by zig`);
                }
                const paths = envPaths('napi-rs');
                const shellFileExt = process.platform === 'win32' ? 'bat' : 'sh';
                const linkerWrapperShell = join(paths.cache, `zig-linker-${triple.raw}.${shellFileExt}`);
                const CCWrapperShell = join(paths.cache, `zig-cc-${triple.raw}.${shellFileExt}`);
                const CXXWrapperShell = join(paths.cache, `zig-cxx-${triple.raw}.${shellFileExt}`);
                const linkerWrapper = join(paths.cache, `zig-cc-${triple.raw}.js`);
                mkdirSync(paths.cache, { recursive: true });
                const forwardArgs = process.platform === 'win32' ? '%*' : '$@';
                yield writeFileAsync(linkerWrapperShell, `#!/bin/sh\nnode ${linkerWrapper} ${forwardArgs}`, {
                    mode: '777',
                });
                yield writeFileAsync(CCWrapperShell, `#!/bin/sh\nzig cc -target ${zigTarget} ${forwardArgs}`, {
                    mode: '777',
                });
                yield writeFileAsync(CXXWrapperShell, `#!/bin/sh\nzig c++ -target ${zigTarget} ${forwardArgs}`, {
                    mode: '777',
                });
                yield writeFileAsync(linkerWrapper, `#!/usr/bin/env node\nconst{writeFileSync} = require('fs')\n${processZigLinkerArgs.toString()}\nconst {status} = require('child_process').spawnSync('zig', ['${triple.platform === 'win32' ? 'c++' : 'cc'}', ...processZigLinkerArgs('${triple.raw}', process.argv.slice(2)), '-target', '${zigTarget}'], { stdio: 'inherit', shell: true })\nwriteFileSync('${linkerWrapper.replaceAll('\\', '/')}.args.log', processZigLinkerArgs('${triple.raw}', process.argv.slice(2)).join(' '))\n\nprocess.exit(status || 0)\n`, {
                    mode: '777',
                });
                const envTarget = triple.raw.replaceAll('-', '_').toUpperCase();
                Object.assign(additionalEnv, {
                    CC: CCWrapperShell,
                    CXX: CXXWrapperShell,
                    TARGET_CC: CCWrapperShell,
                    TARGET_CXX: CXXWrapperShell,
                });
                additionalEnv[`CARGO_TARGET_${envTarget}_LINKER`] = linkerWrapperShell;
            }
            execSync(cargoCommand, {
                env: Object.assign(Object.assign(Object.assign({}, process.env), additionalEnv), { TYPE_DEF_TMP_PATH: intermediateTypeFile }),
                stdio: ['inherit', 'inherit', 'inherit'],
                cwd,
            });
            const { binaryName, packageName } = getNapiConfig(this.configFileName);
            let cargoArtifactName = this.cargoName;
            if (!cargoArtifactName) {
                if (this.bin) {
                    cargoArtifactName = cargoPackageName;
                }
                else {
                    cargoArtifactName = cargoPackageName.replace(/-/g, '_');
                }
                if (!this.bin && !((_f = (_e = (_d = tomlContent.lib) === null || _d === void 0 ? void 0 : _d['crate-type']) === null || _e === void 0 ? void 0 : _e.includes) === null || _f === void 0 ? void 0 : _f.call(_e, 'cdylib'))) {
                    throw new TypeError(`Missing ${chalk.green('crate-type = ["cdylib"]')} in ${chalk.green('[lib]')}`);
                }
            }
            if (this.bin) {
                debug(`Binary name: ${chalk.greenBright(cargoArtifactName)}`);
            }
            else {
                debug(`Dylib name: ${chalk.greenBright(cargoArtifactName)}`);
            }
            const platform = triple.platform;
            let libExt = '';
            debug(`Platform: ${chalk.greenBright(platform)}`);
            // Platform based massaging for build commands
            if (!this.bin) {
                switch (platform) {
                    case 'darwin':
                        libExt = '.dylib';
                        cargoArtifactName = `lib${cargoArtifactName}`;
                        break;
                    case 'win32':
                        libExt = '.dll';
                        break;
                    case 'linux':
                    case 'freebsd':
                    case 'openbsd':
                    case 'android':
                    case 'sunos':
                        cargoArtifactName = `lib${cargoArtifactName}`;
                        libExt = '.so';
                        break;
                    default:
                        throw new TypeError('Operating system not currently supported or recognized by the build script');
                }
            }
            const targetRootDir = 
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            process.env.CARGO_TARGET_DIR ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                process.env.CARGO_BUILD_TARGET_DIR ||
                (yield findUp(cwd));
            if (!targetRootDir) {
                throw new TypeError('No target dir found');
            }
            const targetDir = join(this.targetTripleDir, this.isRelease ? 'release' : 'debug');
            const platformName = this.appendPlatformToFilename
                ? `.${triple.platformArchABI}`
                : '';
            debug(`Platform name: ${platformName || chalk.green('[Empty]')}`);
            const distFileName = this.bin
                ? cargoArtifactName
                : `${binaryName}${platformName}.node`;
            const distModulePath = join((_g = this.destDir) !== null && _g !== void 0 ? _g : '.', distFileName);
            const parsedDist = parse(distModulePath);
            if (parsedDist.dir && !existsSync(parsedDist.dir)) {
                yield mkdirAsync(parsedDist.dir, { recursive: true }).catch((e) => {
                    console.warn(chalk.bgYellowBright(`Create dir [${parsedDist.dir}] failed, reason: ${e.message}`));
                });
            }
            const sourcePath = join(targetRootDir, 'target', targetDir, `${cargoArtifactName}${libExt}`);
            if (existsSync(distModulePath)) {
                debug(`remove old binary [${chalk.yellowBright(distModulePath)}]`);
                yield unlinkAsync(distModulePath);
            }
            debug(`Write binary content to [${chalk.yellowBright(distModulePath)}]`);
            yield copyFileAsync(sourcePath, distModulePath);
            if (!this.bin) {
                const dtsFilePath = join(process.cwd(), (_h = this.destDir) !== null && _h !== void 0 ? _h : '.', (_j = this.dts) !== null && _j !== void 0 ? _j : 'index.d.ts');
                if (this.pipe) {
                    const pipeCommand = `${this.pipe} ${dtsFilePath}`;
                    console.info(`Run ${chalk.green(pipeCommand)}`);
                    try {
                        execSync(pipeCommand, { stdio: 'inherit', env: process.env });
                    }
                    catch (e) {
                        console.warn(chalk.bgYellowBright('Pipe the dts file to command failed'), e);
                    }
                }
                const jsBindingFilePath = this.jsBinding &&
                    this.jsBinding !== 'false' &&
                    this.appendPlatformToFilename
                    ? join(process.cwd(), this.jsBinding)
                    : null;
                const idents = yield processIntermediateTypeFile(intermediateTypeFile, dtsFilePath, this.noDtsHeader);
                yield writeJsBinding(binaryName, (_k = this.jsPackageName) !== null && _k !== void 0 ? _k : packageName, jsBindingFilePath, idents);
                if (this.pipe && jsBindingFilePath) {
                    const pipeCommand = `${this.pipe} ${jsBindingFilePath}`;
                    console.info(`Run ${chalk.green(pipeCommand)}`);
                    try {
                        execSync(pipeCommand, { stdio: 'inherit', env: process.env });
                    }
                    catch (e) {
                        console.warn(chalk.bgYellowBright('Pipe the js binding file to command failed'), e);
                    }
                }
            }
        });
    }
}
BuildCommand.usage = Command.Usage({
    description: 'Build and copy native module into specified dir',
});
BuildCommand.paths = [['build']];
function findUp(dir = process.cwd()) {
    return __awaiter(this, void 0, void 0, function* () {
        const dist = join(dir, 'target');
        if (existsSync(dist)) {
            return dir;
        }
        const dirs = dir.split(sep);
        if (dirs.length < 2) {
            return null;
        }
        dirs.pop();
        return findUp(dirs.join(sep));
    });
}
function enableTsTypeCache() {
    return !process.env.TS_RENEW;
}
function processIntermediateTypeFile(source, target, noDtsHeader) {
    return __awaiter(this, void 0, void 0, function* () {
        const idents = [];
        if (!existsSync(source)) {
            debug(`do not find tmp type file. skip type generation`);
            return idents;
        }
        const tmpFile = yield readFileAsync(source, 'utf8');
        let types = [];
        // complete dts generation from cache
        // We diff this time type gen info with previous one
        // Object<crate name -> Array<type def>>
        const crate2types = tmpFile
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            // now: [ crate_name, type def, crate_name, type def, ... ]
            // we make it a map, crate_name -> [type def, type def, ...]
            .reduce((map, curr, i, arr) => {
            if (i % 2 === 0) {
                // crate name
                if (!map[curr]) {
                    map[curr] = [];
                }
            }
            else {
                // type def
                map[arr[i - 1]].push(JSON.parse(curr));
            }
            return map;
        }, {});
        yield addCacheTsTypeGen(crate2types);
        types = Reflect.ownKeys(crate2types)
            .map((crate) => [...crate2types[crate]])
            .flat();
        if (!types.length) {
            return idents;
        }
        function convertDefs(defs, nested = false) {
            const classes = new Map();
            const impls = new Map();
            let dts = '';
            const nest = nested ? 2 : 0;
            defs.forEach((def) => {
                switch (def.kind) {
                    case 'struct':
                        if (!nested) {
                            idents.push(def.name);
                        }
                        classes.set(def.name, {
                            original_name: def.original_name,
                            def: def.def,
                            js_doc: def.js_doc,
                        });
                        break;
                    case 'impl':
                        const existed = impls.get(def.name);
                        impls.set(def.name, `${existed ? existed + '\n' : ''}${def.js_doc}${def.def}`);
                        break;
                    case 'interface':
                        dts +=
                            indentLines(`${def.js_doc}export interface ${def.name} {`, nest) +
                                '\n';
                        dts += indentLines(def.def, nest + 2) + '\n';
                        dts += indentLines(`}`, nest) + '\n';
                        break;
                    case 'enum':
                        if (!nested) {
                            idents.push(def.name);
                        }
                        dts +=
                            indentLines(`${def.js_doc}export const enum ${def.name} {`, nest) +
                                '\n';
                        dts += indentLines(def.def, nest + 2) + '\n';
                        dts += indentLines(`}`, nest) + '\n';
                        break;
                    default:
                        if (!nested) {
                            idents.push(def.name);
                        }
                        dts += indentLines(`${def.js_doc}${def.def}`, nest) + '\n';
                }
            });
            for (const [name, { js_doc, def, original_name }] of classes.entries()) {
                const implDef = impls.get(name);
                if (original_name && name !== original_name) {
                    dts += indentLines(`export type ${original_name} = ${name}\n`, nest);
                }
                dts += indentLines(`${js_doc}export class ${name} {`, nest);
                if (def) {
                    dts += '\n' + indentLines(def, nest + 2);
                }
                if (implDef) {
                    dts += '\n' + indentLines(implDef, nest + 2);
                }
                if (def || implDef) {
                    dts += '\n';
                }
                else {
                    dts += ` `;
                }
                dts += indentLines(`}`, nest) + '\n';
            }
            return dts;
        }
        const topLevelDef = convertDefs(types.filter((def) => !def.js_mod));
        const namespaceDefs = Object.entries(groupBy(types.filter((def) => def.js_mod), 'js_mod')).reduce((acc, [mod, defs]) => {
            idents.push(mod);
            return acc + `export namespace ${mod} {\n${convertDefs(defs, true)}}\n`;
        }, '');
        const dtsHeader = noDtsHeader
            ? ''
            : `/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */\n
`;
        const externalDef = topLevelDef.indexOf('ExternalObject<') > -1 ||
            namespaceDefs.indexOf('ExternalObject<') > -1
            ? `export class ExternalObject<T> {
  readonly '': {
    readonly '': unique symbol
    [K: symbol]: T
  }
}\n`
            : '';
        yield unlinkAsync(source);
        yield writeFileAsync(target, dtsHeader + externalDef + topLevelDef + namespaceDefs, 'utf8');
        return idents;
    });
}
function addCacheTsTypeGen(crate2types) {
    return __awaiter(this, void 0, void 0, function* () {
        // Complete crate -> type info map in the previous build
        const cachedPath = join(tmpdir(), 'type_def.old.tmp');
        const prevCrate2types = existsSync(cachedPath)
            ? JSON.parse(yield readFileAsync(cachedPath, 'utf8'))
            : {};
        if (enableTsTypeCache()) {
            for (const crate of Reflect.ownKeys(prevCrate2types)) {
                if (!crate2types[crate]) {
                    // Now there are 2 possibilities
                    // 1. Incremental compilation, and the crate is skipped, so it's ts type info is not collected by proc macro
                    // 2. The napi derive is deleted by user.
                    // We distinguish this 2 by checking if the crate is in those changed crates
                    // if this crate is not recompiled crate, meaning it's ts type should be included
                    // if this crate is in recompiled crate but ts type is not collected, meaning napi derive is removed, simply skip
                    crate2types[crate] = prevCrate2types[crate];
                }
            }
        }
        // record as old tmp file for next gen
        yield writeFileAsync(cachedPath, JSON.stringify(crate2types), 'utf8');
    });
}
function indentLines(input, spaces) {
    return input
        .split('\n')
        .map((line) => ''.padEnd(spaces, ' ') +
        (line.startsWith(' *') ? line.trimEnd() : line.trim()))
        .join('\n');
}
function writeJsBinding(localName, packageName, distFileName, idents) {
    return __awaiter(this, void 0, void 0, function* () {
        if (distFileName && idents.length) {
            const template = createJsBinding(localName, packageName);
            const declareCodes = `const { ${idents.join(', ')} } = nativeBinding\n`;
            const exportsCode = idents.reduce((acc, cur) => `${acc}\nmodule.exports.${cur} = ${cur}`, '');
            yield writeFileAsync(distFileName, template + declareCodes + exportsCode + '\n', 'utf8');
        }
    });
}
//# sourceMappingURL=build.js.map