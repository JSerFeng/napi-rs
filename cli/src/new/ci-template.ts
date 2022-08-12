export const YAML = (app: string) => `
name: CI

env:
  DEBUG: 'napi:*'
  APP_NAME: '${app}'
  MACOSX_DEPLOYMENT_TARGET: '10.13'

on:
  push:
    branches:
      - main
    tags-ignore:
      - '**'
    paths-ignore:
      - '**/*.md'
      - 'LICENSE'
      - '**/*.gitignore'
      - '.editorconfig'
      - 'docs/**'
  pull_request:

jobs:
  build:
    if: "!contains(github.event.head_commit.message, 'skip ci')"

    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-latest
            target: 'x86_64-apple-darwin'
            build: |
              yarn build
              strip -x *.node
          - host: windows-latest
            build: yarn build
            target: 'x86_64-pc-windows-msvc'
          - host: windows-latest
            build: |
              yarn build --target i686-pc-windows-msvc
              yarn test
            target: 'i686-pc-windows-msvc'
          - host: ubuntu-latest
            target: 'x86_64-unknown-linux-gnu'
            docker: ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian
            build: >-
              set -e &&\n
              yarn build --target x86_64-unknown-linux-gnu &&\n
              strip *.node
          - host: ubuntu-latest
            target: 'x86_64-unknown-linux-musl'
            docker: ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-alpine
            build: >-
              set -e &&
              yarn build &&
              strip *.node
          - host: macos-latest
            target: 'aarch64-apple-darwin'
            build: |
              sudo rm -Rf /Library/Developer/CommandLineTools/SDKs/*;
              export CC=$(xcrun -f clang);
              export CXX=$(xcrun -f clang++);
              SYSROOT=$(xcrun --sdk macosx --show-sdk-path);
              export CFLAGS="-isysroot $SYSROOT -isystem $SYSROOT";
              yarn build --target aarch64-apple-darwin
              strip -x *.node
          - host: ubuntu-latest
            target: 'aarch64-unknown-linux-gnu'
            docker: ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian-aarch64
            build: >-
              set -e &&\n
              yarn build --target aarch64-unknown-linux-gnu &&\n
              aarch64-unknown-linux-gnu-strip *.node
          - host: ubuntu-latest
            target: 'armv7-unknown-linux-gnueabihf'
            setup: |
              sudo apt-get update
              sudo apt-get install gcc-arm-linux-gnueabihf g++-arm-linux-gnueabihf -y
            build: |
              yarn build --target=armv7-unknown-linux-gnueabihf
              arm-linux-gnueabihf-strip *.node
          - host: ubuntu-latest
            target: 'aarch64-linux-android'
            build: |
              export CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android24-clang"
              export CC="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android24-clang"
              export CXX="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android24-clang++"
              export AR="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
              export PATH="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin:\${PATH}"
              yarn build --target aarch64-linux-android
              \${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip *.node
          - host: ubuntu-latest
            target: 'armv7-linux-androideabi'
            build: |
              export CARGO_TARGET_ARMV7_LINUX_ANDROIDEABI_LINKER="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi24-clang"
              export CC="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi24-clang"
              export CXX="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi24-clang++"
              export AR="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
              export PATH="\${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin:\${PATH}"
              yarn build --target armv7-linux-androideabi
              \${ANDROID_NDK_LATEST_HOME}/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-strip *.node
          - host: ubuntu-latest
            target: 'aarch64-unknown-linux-musl'
            docker: ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-alpine
            build: >-
              set -e &&\n
              rustup target add aarch64-unknown-linux-musl &&\n
              yarn build --target aarch64-unknown-linux-musl &&\n
              /aarch64-linux-musl-cross/bin/aarch64-linux-musl-strip *.node
          - host: windows-latest
            target: 'aarch64-pc-windows-msvc'
            build: yarn build --target aarch64-pc-windows-msvc

    name: stable - \${{ matrix.settings.target }} - node@16
    runs-on: \${{ matrix.settings.host }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3
        if: \${{ !matrix.settings.docker }}
        with:
          node-version: 16
          check-latest: true
          cache: yarn

      - name: Install
        uses: actions-rs/toolchain@v1
        if: \${{ !matrix.settings.docker }}
        with:
          profile: minimal
          override: true
          toolchain: stable
          target: \${{ matrix.settings.target }}

      - name: Cache cargo
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/registry/index/
            ~/.cargo/registry/cache/
            ~/.cargo/git/db/
            .cargo-cache
            target/
          key: \${{ matrix.settings.target }}-cargo-\${{ matrix.settings.host }}

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-build-\${{ matrix.settings.target }}-node@16

      - name: Setup toolchain
        run: \${{ matrix.settings.setup }}
        if: \${{ matrix.settings.setup }}
        shell: bash

      - name: Setup node x86
        if: matrix.settings.target == 'i686-pc-windows-msvc'
        run: yarn config set supportedArchitectures.cpu "ia32"
        shell: bash

      - name: 'Install dependencies'
        run: yarn install

      - name: Setup node x86
        uses: actions/setup-node@v3
        if: matrix.settings.target == 'i686-pc-windows-msvc'
        with:
          node-version: 16
          check-latest: true
          cache: yarn
          architecture: x86

      - name: Build in docker
        uses: addnab/docker-run-action@v3
        if: \${{ matrix.settings.docker }}
        with:
          image: \${{ matrix.settings.docker }}
          options: --user 0:0 -v \${{ github.workspace }}/.cargo-cache/git/db:/usr/local/cargo/git/db -v \${{ github.workspace }}/.cargo/registry/cache:/usr/local/cargo/registry/cache -v \${{ github.workspace }}/.cargo/registry/index:/usr/local/cargo/registry/index -v \${{ github.workspace }}:/build -w /build
          run: \${{ matrix.settings.build }}

      - name: 'Build'
        run: \${{ matrix.settings.build }}
        if: \${{ !matrix.settings.docker }}
        shell: bash

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: bindings-\${{ matrix.settings.target }}
          path: \${{ env.APP_NAME }}.*.node
          if-no-files-found: error

  build-freebsd:
    runs-on: macos-12
    name: Build FreeBSD
    steps:
      - uses: actions/checkout@v3
      - name: Build
        id: build
        uses: vmactions/freebsd-vm@v0
        env:
          DEBUG: 'napi:*'
          RUSTUP_HOME: /usr/local/rustup
          CARGO_HOME: /usr/local/cargo
          RUSTUP_IO_THREADS: 1
        with:
          envs: 'DEBUG RUSTUP_HOME CARGO_HOME RUSTUP_IO_THREADS'
          usesh: true
          mem: 3000
          prepare: |
            pkg install -y curl node14 python2
            curl -qL https://www.npmjs.com/install.sh | sh
            npm install --location=global yarn
            curl https://sh.rustup.rs -sSf --output rustup.sh
            sh rustup.sh -y --profile minimal --default-toolchain stable
            export PATH="/usr/local/cargo/bin:$PATH"
            echo "~~~~ rustc --version ~~~~"
            rustc --version
            echo "~~~~ node -v ~~~~"
            node -v
            echo "~~~~ yarn --version ~~~~"
            yarn --version
          run: |
            export PATH="/usr/local/cargo/bin:$PATH"
            pwd
            ls -lah
            whoami
            env
            freebsd-version
            yarn install
            yarn build
            strip -x *.node
            yarn test
            rm -rf node_modules
            rm -rf target
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: bindings-freebsd
          path: \${{ env.APP_NAME }}.*.node
          if-no-files-found: error

  test-macOS-windows-binding:
    name: Test bindings on \${{ matrix.settings.target }} - node@\${{ matrix.node }}
    needs:
      - build
    strategy:
      fail-fast: false
      matrix:
        settings:
          - host: macos-latest
            target: 'x86_64-apple-darwin'
          - host: windows-latest
            target: 'x86_64-pc-windows-msvc'
        node: ['14', '16', '18']
    runs-on: \${{ matrix.settings.host }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node }}
          check-latest: true
          cache: 'yarn'

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-test-\${{ matrix.settings.target }}-\${{ matrix.node }}-\${{ hashFiles('yarn.lock') }}

      - name: 'Install dependencies'
        run: yarn install

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: bindings-\${{ matrix.settings.target }}
          path: .

      - name: List packages
        run: ls -R .
        shell: bash

      - name: Test bindings
        run: yarn test

  test-linux-x64-gnu-binding:
    name: Test bindings on Linux-x64-gnu - node@\${{ matrix.node }}
    needs:
      - build
    strategy:
      fail-fast: false
      matrix:
        node: ['14', '16', '18']
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node }}
          check-latest: true
          cache: 'yarn'

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-test-linux-x64-gnu-\${{ matrix.node }}

      - name: 'Install dependencies'
        run: yarn install

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: bindings-x86_64-unknown-linux-gnu
          path: .

      - name: List packages
        run: ls -R .
        shell: bash

      - name: Test bindings
        run: docker run --rm -v $(pwd):/build -w /build node:\${{ matrix.node }}-slim yarn test

  test-linux-x64-musl-binding:
    name: Test bindings on x86_64-unknown-linux-musl - node@\${{ matrix.node }}
    needs:
      - build
    strategy:
      fail-fast: false
      matrix:
        node: ['14', '16', '18']
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node }}
          check-latest: true
          cache: 'yarn'

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-test-x86_64-unknown-linux-musl-\${{ matrix.node }}

      - name: 'Install dependencies'
        run: |
          yarn config set supportedArchitectures.libc "musl"
          yarn install

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: bindings-x86_64-unknown-linux-musl
          path: .

      - name: List packages
        run: ls -R .
        shell: bash

      - name: Test bindings
        run: docker run --rm -v $(pwd):/build -w /build node:\${{ matrix.node }}-alpine yarn test

  test-linux-aarch64-gnu-binding:
    name: Test bindings on aarch64-unknown-linux-gnu - node@\${{ matrix.node }}
    needs:
      - build
    strategy:
      fail-fast: false
      matrix:
        node: ['14', '16', '18']
    runs-on: ubuntu-latest

    steps:
      - run: docker run --rm --privileged multiarch/qemu-user-static:register --reset

      - uses: actions/checkout@v3

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: bindings-aarch64-unknown-linux-gnu
          path: .

      - name: List packages
        run: ls -R .
        shell: bash

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-test-linux-aarch64-gnu-\${{ matrix.node }}

      - name: Install dependencies
        run: |
          yarn config set supportedArchitectures.cpu "arm64"
          yarn config set supportedArchitectures.libc "glibc"
          yarn install

      - name: Setup and run tests
        uses: addnab/docker-run-action@v3
        with:
          image: ghcr.io/napi-rs/napi-rs/nodejs:aarch64-\${{ matrix.node }}
          options: -v \${{ github.workspace }}:/build -w /build
          run: |
            set -e
            yarn test
            ls -la

  test-linux-aarch64-musl-binding:
    name: Test bindings on aarch64-unknown-linux-musl - node@\${{ matrix.node }}
    needs:
      - build

    runs-on: ubuntu-latest

    steps:
      - run: docker run --rm --privileged multiarch/qemu-user-static:register --reset

      - uses: actions/checkout@v3

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: bindings-aarch64-unknown-linux-musl
          path: .

      - name: List packages
        run: ls -R .
        shell: bash

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-test-linux-aarch64-musl-\${{ matrix.node }}

      - name: Install dependencies
        run: |
          yarn config set supportedArchitectures.cpu "arm64"
          yarn config set supportedArchitectures.libc "musl"
          yarn install

      - name: Setup and run tests
        uses: addnab/docker-run-action@v3
        with:
          image: multiarch/alpine:aarch64-latest-stable
          options: -v \${{ github.workspace }}:/build -w /build
          run: |
            set -e
            apk add nodejs npm yarn
            yarn test

  test-linux-arm-gnueabihf-binding:
    name: Test bindings on armv7-unknown-linux-gnueabihf - node@\${{ matrix.node }}
    needs:
      - build
    strategy:
      fail-fast: false
      matrix:
        node: ['14', '16', '18']
    runs-on: ubuntu-latest

    steps:
      - run: docker run --rm --privileged multiarch/qemu-user-static:register --reset

      - uses: actions/checkout@v3

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: bindings-armv7-unknown-linux-gnueabihf
          path: .

      - name: List packages
        run: ls -R .
        shell: bash

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-test-linux-arm-gnueabihf-\${{ matrix.node }}

      - name: Install dependencies
        run: |
          yarn config set supportedArchitectures.cpu "arm"
          yarn install

      - name: Setup and run tests
        uses: addnab/docker-run-action@v3
        with:
          image: ghcr.io/napi-rs/napi-rs/nodejs:armhf-\${{ matrix.node }}
          options: -v \${{ github.workspace }}:/build -w /build
          run: |
            set -e
            yarn test
            ls -la

  publish:
    name: Publish
    runs-on: ubuntu-latest
    needs:
      - test-linux-x64-gnu-binding
      - test-linux-x64-musl-binding
      - test-linux-aarch64-gnu-binding
      - test-linux-arm-gnueabihf-binding
      - test-macOS-windows-binding
      - test-linux-aarch64-musl-binding
      - build-freebsd

    steps:
      - uses: actions/checkout@v3

      - name: Setup node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          check-latest: true
          cache: 'yarn'

      - name: Cache NPM dependencies
        uses: actions/cache@v3
        with:
          path: .yarn/cache
          key: npm-cache-ubuntu-latest-publish
      - name: 'Install dependencies'
        run: yarn install

      - name: Download all artifacts
        uses: actions/download-artifact@v3
        with:
          path: artifacts

      - name: Move artifacts
        run: yarn artifacts

      - name: List packages
        run: ls -R ./npm
        shell: bash

      - name: Publish
        run: |
          if git log -1 --pretty=%B | grep "^[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+$";
          then
            echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
            npm publish --access public
          elif git log -1 --pretty=%B | grep "^[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+";
          then
            echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> ~/.npmrc
            npm publish --tag next --access public
          else
            echo "Not a release, skipping publish"
          fi
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
`
