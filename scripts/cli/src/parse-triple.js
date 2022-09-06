import { execSync } from 'child_process';
const CpuToNodeArch = {
    x86_64: 'x64',
    aarch64: 'arm64',
    i686: 'ia32',
    armv7: 'arm',
};
const SysToNodePlatform = {
    linux: 'linux',
    freebsd: 'freebsd',
    darwin: 'darwin',
    windows: 'win32',
};
export const DefaultPlatforms = [
    {
        platform: 'win32',
        arch: 'x64',
        abi: 'msvc',
        platformArchABI: 'win32-x64-msvc',
        raw: 'x86_64-pc-windows-msvc',
    },
    {
        platform: 'darwin',
        arch: 'x64',
        abi: null,
        platformArchABI: 'darwin-x64',
        raw: 'x86_64-apple-darwin',
    },
    {
        platform: 'linux',
        arch: 'x64',
        abi: 'gnu',
        platformArchABI: 'linux-x64-gnu',
        raw: 'x86_64-unknown-linux-gnu',
    },
];
/**
 * A triple is a specific format for specifying a target architecture.
 * Triples may be referred to as a target triple which is the architecture for the artifact produced, and the host triple which is the architecture that the compiler is running on.
 * The general format of the triple is `<arch><sub>-<vendor>-<sys>-<abi>` where:
 *   - `arch` = The base CPU architecture, for example `x86_64`, `i686`, `arm`, `thumb`, `mips`, etc.
 *   - `sub` = The CPU sub-architecture, for example `arm` has `v7`, `v7s`, `v5te`, etc.
 *   - `vendor` = The vendor, for example `unknown`, `apple`, `pc`, `nvidia`, etc.
 *   - `sys` = The system name, for example `linux`, `windows`, `darwin`, etc. none is typically used for bare-metal without an OS.
 *   - `abi` = The ABI, for example `gnu`, `android`, `eabi`, etc.
 */
export function parseTriple(rawTriple) {
    var _a, _b;
    const triple = rawTriple.endsWith('eabi')
        ? `${rawTriple.slice(0, -4)}-eabi`
        : rawTriple;
    const triples = triple.split('-');
    let cpu;
    let sys;
    let abi = null;
    if (triples.length === 4) {
        ;
        [cpu, , sys, abi = null] = triples;
    }
    else if (triples.length === 3) {
        ;
        [cpu, , sys] = triples;
    }
    else {
        ;
        [cpu, sys] = triples;
    }
    const platformName = (_a = SysToNodePlatform[sys]) !== null && _a !== void 0 ? _a : sys;
    const arch = (_b = CpuToNodeArch[cpu]) !== null && _b !== void 0 ? _b : cpu;
    return {
        platform: platformName,
        arch,
        abi,
        platformArchABI: abi
            ? `${platformName}-${arch}-${abi}`
            : `${platformName}-${arch}`,
        raw: rawTriple,
    };
}
export function getHostTargetTriple() {
    const host = execSync(`rustc -vV`, {
        env: process.env,
    })
        .toString('utf8')
        .split('\n')
        .find((line) => line.startsWith('host: '));
    const triple = host === null || host === void 0 ? void 0 : host.slice('host: '.length);
    if (!triple) {
        throw new TypeError(`Can not parse target triple from host`);
    }
    return parseTriple(triple);
}
//# sourceMappingURL=parse-triple.js.map