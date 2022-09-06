import { __awaiter } from "tslib";
import { createReadStream, existsSync, statSync } from 'fs';
import { join } from 'path';
import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { Command, Option } from 'clipanion';
import { getNapiConfig } from './consts';
import { debugFactory } from './debug';
import { spawn } from './spawn';
import { updatePackageJson } from './update-package';
import { VersionCommand } from './version';
const debug = debugFactory('prepublish');
export class PrePublishCommand extends Command {
    constructor() {
        super(...arguments);
        this.prefix = Option.String(`-p,--prefix`, 'npm');
        this.tagStyle = Option.String('--tagstyle,-t', 'lerna');
        this.configFileName = Option.String('-c,--config');
        this.isDryRun = Option.Boolean('--dry-run', false);
        this.skipGHRelease = Option.Boolean('--skip-gh-release', false);
        this.ghReleaseName = Option.String('--gh-release-name');
        this.existingReleaseId = Option.String('--gh-release-id');
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const { packageJsonPath, platforms, version, packageName, binaryName, npmClient, } = getNapiConfig(this.configFileName);
            debug(`Update optionalDependencies in [${packageJsonPath}]`);
            if (!this.isDryRun) {
                yield VersionCommand.updatePackageJson(this.prefix, this.configFileName);
                yield updatePackageJson(packageJsonPath, {
                    optionalDependencies: platforms.reduce((acc, cur) => {
                        acc[`${packageName}-${cur.platformArchABI}`] = `${version}`;
                        return acc;
                    }, {}),
                });
            }
            const { owner, repo, pkgInfo, octokit } = this.existingReleaseId
                ? yield this.getRepoInfo(packageName, version)
                : yield this.createGhRelease(packageName, version);
            for (const platformDetail of platforms) {
                const pkgDir = join(process.cwd(), this.prefix, `${platformDetail.platformArchABI}`);
                const filename = `${binaryName}.${platformDetail.platformArchABI}.node`;
                const dstPath = join(pkgDir, filename);
                if (!this.isDryRun) {
                    if (!existsSync(dstPath)) {
                        console.warn(`[${chalk.yellowBright(dstPath)}] doesn't exist`);
                        continue;
                    }
                    yield spawn(`${npmClient} publish`, {
                        cwd: pkgDir,
                        env: process.env,
                    });
                    if (!this.skipGHRelease && repo && owner) {
                        debug(`Start upload [${chalk.greenBright(dstPath)}] to Github release, [${chalk.greenBright(pkgInfo.tag)}]`);
                        try {
                            const releaseId = this.existingReleaseId
                                ? Number(this.existingReleaseId)
                                : (yield octokit.repos.getReleaseByTag({
                                    repo: repo,
                                    owner: owner,
                                    tag: pkgInfo.tag,
                                })).data.id;
                            const dstFileStats = statSync(dstPath);
                            const assetInfo = yield octokit.repos.uploadReleaseAsset({
                                owner: owner,
                                repo: repo,
                                name: filename,
                                release_id: releaseId,
                                mediaType: { format: 'raw' },
                                headers: {
                                    'content-length': dstFileStats.size,
                                    'content-type': 'application/octet-stream',
                                },
                                // @ts-expect-error
                                data: createReadStream(dstPath),
                            });
                            console.info(`${chalk.green(dstPath)} upload success`);
                            console.info(`Download url: ${chalk.blueBright(assetInfo.data.browser_download_url)}`);
                        }
                        catch (e) {
                            debug(`Param: ${JSON.stringify({ owner, repo, tag: pkgInfo.tag, filename: dstPath }, null, 2)}`);
                            console.error(e);
                        }
                    }
                }
            }
        });
    }
    createGhRelease(packageName, version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.skipGHRelease) {
                return {
                    owner: null,
                    repo: null,
                    pkgInfo: { name: null, version: null, tag: null },
                };
            }
            const { repo, owner, pkgInfo, octokit } = yield this.getRepoInfo(packageName, version);
            if (!repo || !owner) {
                return {
                    owner: null,
                    repo: null,
                    pkgInfo: { name: null, version: null, tag: null },
                };
            }
            if (!this.isDryRun) {
                try {
                    yield octokit.repos.createRelease({
                        owner,
                        repo,
                        tag_name: pkgInfo.tag,
                        name: this.ghReleaseName,
                        prerelease: version.includes('alpha') ||
                            version.includes('beta') ||
                            version.includes('rc'),
                    });
                }
                catch (e) {
                    debug(`Params: ${JSON.stringify({ owner, repo, tag_name: pkgInfo.tag }, null, 2)}`);
                    console.error(e);
                }
            }
            return { owner, repo, pkgInfo, octokit };
        });
    }
    getRepoInfo(packageName, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const headCommit = (yield spawn('git log -1 --pretty=%B'))
                .toString('utf8')
                .trim();
            const { GITHUB_REPOSITORY } = process.env;
            if (!GITHUB_REPOSITORY) {
                return {
                    owner: null,
                    repo: null,
                    pkgInfo: { name: null, version: null, tag: null },
                };
            }
            debug(`Github repository: ${GITHUB_REPOSITORY}`);
            const [owner, repo] = GITHUB_REPOSITORY.split('/');
            const octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN,
            });
            let pkgInfo;
            if (this.tagStyle === 'lerna') {
                const packagesToPublish = headCommit
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line, index) => line.length && index)
                    .map((line) => line.substring(2))
                    .map(this.parseTag);
                pkgInfo = packagesToPublish.find((pkgInfo) => pkgInfo.name === packageName);
                if (!pkgInfo) {
                    throw new TypeError(`No release commit found with ${packageName}, original commit info: ${headCommit}`);
                }
            }
            else {
                pkgInfo = {
                    tag: `v${version}`,
                    version,
                    name: packageName,
                };
            }
            return { owner, repo, pkgInfo, octokit };
        });
    }
    parseTag(tag) {
        const segments = tag.split('@');
        const version = segments.pop();
        const name = segments.join('@');
        return {
            name,
            version,
            tag,
        };
    }
}
PrePublishCommand.usage = Command.Usage({
    description: 'Update package.json and copy addons into per platform packages',
});
PrePublishCommand.paths = [['prepublish']];
//# sourceMappingURL=pre-publish.js.map