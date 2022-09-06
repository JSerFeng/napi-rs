declare namespace _default {
    const input: string;
    const inlineDynamicImports: boolean;
    namespace output {
        const banner: string;
        const file: string;
        const format: string;
        const sourcemap: string;
    }
    const plugins: import("rollup").Plugin[];
}
export default _default;
