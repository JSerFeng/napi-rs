import { join } from 'path';
import { DefaultPlatforms, parseTriple } from './parse-triple';
export function getNapiConfig(packageJson = 'package.json', cwd = process.cwd()) {
    var _a, _b, _c, _d, _e, _f, _g;
    const packageJsonPath = join(cwd, packageJson);
    const pkgJson = require(packageJsonPath);
    const { version: packageVersion, napi, name } = pkgJson;
    const additionPlatforms = ((_b = (_a = napi === null || napi === void 0 ? void 0 : napi.triples) === null || _a === void 0 ? void 0 : _a.additional) !== null && _b !== void 0 ? _b : []).map(parseTriple);
    const defaultPlatforms = ((_c = napi === null || napi === void 0 ? void 0 : napi.triples) === null || _c === void 0 ? void 0 : _c.defaults) === false ? [] : [...DefaultPlatforms];
    const platforms = [...defaultPlatforms, ...additionPlatforms];
    const releaseVersion = process.env.RELEASE_VERSION;
    const releaseVersionWithoutPrefix = (releaseVersion === null || releaseVersion === void 0 ? void 0 : releaseVersion.startsWith('v'))
        ? releaseVersion.substring(1)
        : releaseVersion;
    const version = releaseVersionWithoutPrefix !== null && releaseVersionWithoutPrefix !== void 0 ? releaseVersionWithoutPrefix : packageVersion;
    const packageName = (_e = (_d = napi === null || napi === void 0 ? void 0 : napi.package) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : name;
    const npmClient = (_f = napi === null || napi === void 0 ? void 0 : napi.npmClient) !== null && _f !== void 0 ? _f : 'npm';
    const binaryName = (_g = napi === null || napi === void 0 ? void 0 : napi.name) !== null && _g !== void 0 ? _g : 'index';
    return {
        platforms,
        version,
        packageName,
        binaryName,
        packageJsonPath,
        content: pkgJson,
        npmClient,
    };
}
//# sourceMappingURL=consts.js.map