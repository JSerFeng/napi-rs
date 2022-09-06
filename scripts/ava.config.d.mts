export default configuration;
declare namespace configuration {
    const extensions: string[];
    const files: string[];
    const require: string[];
    namespace environmentVariables {
        const TS_NODE_PROJECT: string;
    }
    const timeout: string;
    const workerThreads: boolean;
    const concurrency: number;
    const failFast: boolean;
    const verbose: boolean;
}
