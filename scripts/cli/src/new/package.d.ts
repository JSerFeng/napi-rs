export declare const createPackageJson: (name: string, binaryName: string, targets: string[]) => {
    name: string;
    version: string;
    main: string;
    types: string;
    napi: {
        name: string;
    };
    license: string;
    devDependencies: {
        '@napi-rs/cli': string;
        ava: string;
    };
    engines: {
        node: string;
    };
    scripts: {
        artifacts: string;
        build: string;
        'build:debug': string;
        prepublishOnly: string;
        test: string;
        version: string;
    };
};
