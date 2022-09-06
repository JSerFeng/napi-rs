import { __awaiter } from "tslib";
import { exec } from 'child_process';
import { join } from 'path';
import test from 'ava';
import { spy } from 'sinon';
import { DEFAULT_COST, add, fibonacci, contains, concatLatin1, concatStr, concatUtf16, roundtripStr, getNums, getWords, sumNums, getMapping, sumMapping, getCwd, Animal, NinjaTurtle, ClassWithFactory, Context, enumToI32, listObjKeys, createObj, mapOption, readFile, throwError, panic, readPackageJson, getPackageJsonName, getBuffer, getEmptyBuffer, readFileAsync, eitherStringOrNumber, returnEither, either3, either4, withoutAbortController, withAbortController, asyncMultiTwo, bigintAdd, createBigInt, createBigIntI64, bigintGetU64AsString, callThreadsafeFunction, threadsafeFunctionThrowError, threadsafeFunctionClosureCapture, asyncPlus100, getGlobal, getUndefined, getNull, setSymbolInObj, createSymbol, threadsafeFunctionFatalMode, createExternal, getExternal, mutateExternal, createExternalString, xxh2, xxh3, xxh64Alias, tsRename, convertU32Array, createExternalTypedArray, mutateTypedArray, receiveAllOptionalObject, fnReceivedAliased, appendBuffer, returnNull, returnUndefined, Dog, Bird, Assets, receiveStrictObject, receiveClassOrNumber, JsClassForEither, receiveMutClassOrNumber, getStrFromObject, returnJsFunction, testSerdeRoundtrip, createObjWithProperty, dateToNumber, chronoDateToMillis, derefUint8Array, chronoDateAdd1Minute, bufferPassThrough, arrayBufferPassThrough, JsRepo, CssStyleSheet, asyncReduceBuffer, callbackReturnPromise, returnEitherClass, eitherFromOption, eitherFromObjects, overrideIndividualArgOnFunction, overrideIndividualArgOnFunctionWithCbArg, createObjectWithClassField, receiveObjectWithClassField, AnotherClassForEither, receiveDifferentClass, useTokioWithoutAsync, getNumArr, getNestedNumArr, CustomFinalize, plusOne, Width, } from '../';
test('export const', (t) => {
    t.is(DEFAULT_COST, 12);
});
test('number', (t) => {
    t.is(add(1, 2), 3);
    t.is(fibonacci(5), 5);
    t.throws(
    // @ts-expect-error
    () => fibonacci(''), void 0, 'Expect value to be Number, but received String');
});
test('string', (t) => {
    t.true(contains('hello', 'ell'));
    t.false(contains('John', 'jn'));
    t.is(concatStr('æ¶½¾DEL'), 'æ¶½¾DEL + Rust 🦀 string!');
    t.is(concatLatin1('æ¶½¾DEL'), 'æ¶½¾DEL + Rust 🦀 string!');
    t.is(concatUtf16('JavaScript 🌳 你好 napi'), 'JavaScript 🌳 你好 napi + Rust 🦀 string!');
    t.is(roundtripStr('what up?!\u0000after the NULL'), 'what up?!\u0000after the NULL');
});
test('array', (t) => {
    t.deepEqual(getNums(), [1, 1, 2, 3, 5, 8]);
    t.deepEqual(getWords(), ['foo', 'bar']);
    t.is(sumNums([1, 2, 3, 4, 5]), 15);
    t.deepEqual(getNumArr(), [1, 2]);
    t.deepEqual(getNestedNumArr(), [[[1]], [[1]]]);
});
test('map', (t) => {
    t.deepEqual(getMapping(), { a: 101, b: 102 });
    t.is(sumMapping({ a: 101, b: 102 }), 203);
});
test('enum', (t) => {
    t.deepEqual([0 /* Kind.Dog */, 1 /* Kind.Cat */, 2 /* Kind.Duck */], [0, 1, 2]);
    t.is(enumToI32(8 /* CustomNumEnum.Eight */), 8);
});
test('class', (t) => {
    var _a;
    const dog = new Animal(0 /* Kind.Dog */, '旺财');
    t.is(dog.name, '旺财');
    t.is(dog.kind, 0 /* Kind.Dog */);
    t.is(dog.whoami(), 'Dog: 旺财');
    t.notThrows(() => {
        const rawMethod = dog.whoami;
        dog.whoami = function (...args) {
            return rawMethod.apply(this, args);
        };
    });
    dog.name = '可乐';
    t.is(dog.name, '可乐');
    t.deepEqual(dog.returnOtherClass(), new Dog('Doge'));
    t.deepEqual(dog.returnOtherClassWithCustomConstructor(), new Bird('parrot'));
    t.is(dog.overrideIndividualArgOnMethod('Jafar', { n: 'Iago' }).name, 'Jafar-Iago');
    t.is(dog.returnOtherClassWithCustomConstructor().getCount(), 1234);
    t.is(dog.type, 0 /* Kind.Dog */);
    dog.type = 1 /* Kind.Cat */;
    t.is(dog.type, 1 /* Kind.Cat */);
    const assets = new Assets();
    t.is((_a = assets.get(1)) === null || _a === void 0 ? void 0 : _a.filePath, 1);
    const turtle = NinjaTurtle.newRaph();
    t.is(turtle.returnThis(), turtle);
    t.is(NinjaTurtle.isInstanceOf(turtle), true);
    // Inject this to function
    const width = new Width(1);
    t.is(plusOne.call(width), 2);
    t.throws(() => {
        // @ts-expect-error
        plusOne.call('');
    });
});
test('class factory', (t) => {
    const duck = ClassWithFactory.withName('Default');
    t.is(duck.name, 'Default');
    const ret = duck.setName('D');
    t.is(ret.name, 'D');
    t.is(ret, duck);
    duck.name = '周黑鸭';
    t.is(duck.name, '周黑鸭');
    const doge = Animal.withKind(0 /* Kind.Dog */);
    t.is(doge.name, 'Default');
    doge.name = '旺财';
    t.is(doge.name, '旺财');
    const error = t.throws(() => new ClassWithFactory());
    t.true(error.message.startsWith('Class contains no `constructor`, can not new it!'));
});
test('class constructor return Result', (t) => {
    const c = new Context();
    t.is(c.method(), 'not empty');
});
test('class default field is TypedArray', (t) => {
    const c = new Context();
    t.deepEqual(c.buffer, new Uint8Array([0, 1, 2, 3]));
    const fixture = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const c2 = Context.withBuffer(fixture);
    t.is(c2.buffer, fixture);
});
test('class Factory return Result', (t) => {
    const c = Context.withData('not empty');
    t.is(c.method(), 'not empty');
});
test('class in object field', (t) => {
    const obj = createObjectWithClassField();
    t.is(obj.bird.name, 'Carolyn');
    t.is(receiveObjectWithClassField(obj), obj.bird);
});
test('custom finalize class', (t) => {
    t.notThrows(() => new CustomFinalize(200, 200));
});
test('should be able to create object reference and shared reference', (t) => {
    const repo = new JsRepo('.');
    t.is(repo.remote().name(), 'origin');
});
test('should be able to into_reference', (t) => {
    const rules = ['body: { color: red }', 'div: { color: blue }'];
    const sheet = new CssStyleSheet('test.css', rules);
    t.is(sheet.rules, sheet.rules);
    t.deepEqual(sheet.rules.getRules(), rules);
    t.is(sheet.rules.parentStyleSheet, sheet);
    t.is(sheet.rules.name, 'test.css');
    const anotherStyleSheet = sheet.anotherCssStyleSheet();
    t.is(anotherStyleSheet.rules, sheet.rules);
});
test('callback', (t) => {
    getCwd((cwd) => {
        t.is(cwd, process.cwd());
    });
    t.throws(
    // @ts-expect-error
    () => getCwd(), void 0, 'Expect value to be Function, but received Undefined');
    readFile((err, content) => {
        t.is(err, undefined);
        t.is(content, 'hello world');
    });
});
test('return function', (t) => {
    return new Promise((resolve) => {
        returnJsFunction()((err, content) => {
            t.is(err, undefined);
            t.is(content, 'hello world');
            resolve();
        });
    });
});
test('function return Promise', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const cbSpy = spy();
    yield callbackReturnPromise(() => '1', spy);
    t.is(cbSpy.callCount, 0);
    yield callbackReturnPromise(() => Promise.resolve('42'), (err, res) => {
        t.is(err, null);
        cbSpy(res);
    });
    t.is(cbSpy.callCount, 1);
    t.deepEqual(cbSpy.args, [['42']]);
}));
test('object', (t) => {
    t.deepEqual(listObjKeys({ name: 'John Doe', age: 20 }), ['name', 'age']);
    t.deepEqual(createObj(), { test: 1 });
});
test('get str from object', (t) => {
    t.notThrows(() => getStrFromObject());
});
test('create object from Property', (t) => {
    const obj = createObjWithProperty();
    t.true(obj.value instanceof ArrayBuffer);
    t.is(obj.getter, 42);
});
test('global', (t) => {
    t.is(getGlobal(), global);
});
test('get undefined', (t) => {
    for (const _ of Array.from({ length: 100 })) {
        t.is(getUndefined(), undefined);
    }
});
test('get null', (t) => {
    for (const _ of Array.from({ length: 100 })) {
        t.is(getNull(), null);
    }
});
test('return Null', (t) => {
    t.is(returnNull(), null);
});
test('return Undefined', (t) => {
    t.is(returnUndefined(), undefined);
});
test('pass symbol in', (t) => {
    const sym = Symbol('test');
    const obj = setSymbolInObj(sym);
    t.is(obj[sym], 'a symbol');
});
test('create symbol', (t) => {
    t.is(createSymbol().toString(), 'Symbol(a symbol)');
});
test('Option', (t) => {
    t.is(mapOption(null), null);
    t.is(mapOption(3), 4);
});
test('Result', (t) => {
    t.throws(() => throwError(), void 0, 'Manual Error');
    if (!process.env.SKIP_UNWIND_TEST) {
        t.throws(() => panic(), void 0, `Don't panic`);
    }
});
test('function ts type override', (t) => {
    t.deepEqual(tsRename({ foo: 1, bar: 2, baz: 2 }), ['foo', 'bar', 'baz']);
});
test('function individual ts arg type override', (t) => {
    t.is(overrideIndividualArgOnFunction('someStr', () => 'anotherStr', 42), 'oia: someStr-42-anotherStr');
    t.deepEqual(overrideIndividualArgOnFunctionWithCbArg((town, opt) => `im: ${town}-${opt}`, 89), 'im: World(89)-null');
});
test('option object', (t) => {
    t.notThrows(() => receiveAllOptionalObject());
    t.notThrows(() => receiveAllOptionalObject({}));
});
test('should throw if object type is not matched', (t) => {
    // @ts-expect-error
    const err1 = t.throws(() => receiveStrictObject({ name: 1 }));
    t.is(err1.message, 'Failed to convert napi `string` into rust type `String`');
    // @ts-expect-error
    const err2 = t.throws(() => receiveStrictObject({ bar: 1 }));
    t.is(err2.message, 'Missing field `name`');
});
test('aliased rust struct and enum', (t) => {
    const a = 0 /* ALIAS.A */;
    const b = {
        a,
        b: 1,
    };
    t.notThrows(() => fnReceivedAliased(b, 1 /* ALIAS.B */));
});
test('serde-json', (t) => {
    const packageJson = readPackageJson();
    t.is(packageJson.name, 'napi-rs');
    t.is(packageJson.version, '0.0.0');
    t.is(packageJson.dependencies, undefined);
    t.snapshot(Object.keys(packageJson.devDependencies).sort());
    t.is(getPackageJsonName(packageJson), 'napi-rs');
});
test('serde-roundtrip', (t) => {
    t.is(testSerdeRoundtrip(1), 1);
    t.is(testSerdeRoundtrip(1.2), 1.2);
    t.is(testSerdeRoundtrip(-1), -1);
    t.deepEqual(testSerdeRoundtrip([1, 1.2, -1]), [1, 1.2, -1]);
    t.deepEqual(testSerdeRoundtrip({ a: 1, b: 1.2, c: -1 }), {
        a: 1,
        b: 1.2,
        c: -1,
    });
    t.throws(() => testSerdeRoundtrip(NaN));
    t.is(testSerdeRoundtrip(null), null);
    let err = t.throws(() => testSerdeRoundtrip(undefined));
    t.is(err.message, 'undefined cannot be represented as a serde_json::Value');
    err = t.throws(() => testSerdeRoundtrip(() => { }));
    t.is(err.message, 'JS functions cannot be represented as a serde_json::Value');
    err = t.throws(() => testSerdeRoundtrip(Symbol.for('foo')));
    t.is(err.message, 'JS symbols cannot be represented as a serde_json::Value');
});
test('buffer', (t) => {
    let buf = getBuffer();
    t.is(buf.toString('utf-8'), 'Hello world');
    buf = appendBuffer(buf);
    t.is(buf.toString('utf-8'), 'Hello world!');
    const a = getEmptyBuffer();
    const b = getEmptyBuffer();
    t.is(a.toString(), '');
    t.is(b.toString(), '');
});
test('reset empty buffer', (t) => {
    const empty = getEmptyBuffer();
    const shared = new ArrayBuffer(0);
    const buffer = Buffer.from(shared);
    t.notThrows(() => {
        buffer.set(empty);
    });
});
test('convert typedarray to vec', (t) => {
    const input = new Uint32Array([1, 2, 3, 4, 5]);
    t.deepEqual(convertU32Array(input), Array.from(input));
});
test('create external TypedArray', (t) => {
    t.deepEqual(createExternalTypedArray(), new Uint32Array([1, 2, 3, 4, 5]));
});
test('mutate TypedArray', (t) => {
    const input = new Float32Array([1, 2, 3, 4, 5]);
    mutateTypedArray(input);
    t.deepEqual(input, new Float32Array([2.0, 4.0, 6.0, 8.0, 10.0]));
});
test('deref uint8 array', (t) => {
    t.is(derefUint8Array(new Uint8Array([1, 2]), new Uint8ClampedArray([3, 4])), 4);
});
test('async', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const bufPromise = readFileAsync(join(__dirname, '../package.json'));
    yield t.notThrowsAsync(bufPromise);
    const buf = yield bufPromise;
    const { name } = JSON.parse(buf.toString());
    t.is(name, 'examples');
    yield t.throwsAsync(() => readFileAsync('some_nonexist_path.file'));
}));
test('async move', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is(yield asyncMultiTwo(2), 4);
}));
test('buffer passthrough', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fixture = Buffer.from('hello world');
    const ret = yield bufferPassThrough(fixture);
    t.deepEqual(ret, fixture);
}));
test('arraybuffer passthrough', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fixture = new Uint8Array([1, 2, 3, 4, 5]);
    const ret = yield arrayBufferPassThrough(fixture);
    t.deepEqual(ret, fixture);
}));
test('async reduce buffer', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const input = [1, 2, 3, 4, 5, 6];
    const fixture = Buffer.from(input);
    t.is(yield asyncReduceBuffer(fixture), input.reduce((acc, cur) => acc + cur));
}));
test('either', (t) => {
    t.is(eitherStringOrNumber(2), 2);
    t.is(eitherStringOrNumber('hello'), 'hello'.length);
});
test('return either', (t) => {
    t.is(returnEither(2), 2);
    t.is(returnEither(42), '42');
});
test('receive class reference in either', (t) => {
    const c = new JsClassForEither();
    t.is(receiveClassOrNumber(1), 2);
    t.is(receiveClassOrNumber(c), 100);
    t.is(receiveMutClassOrNumber(c), 100);
});
test('receive different class', (t) => {
    const a = new JsClassForEither();
    const b = new AnotherClassForEither();
    t.is(receiveDifferentClass(a), 42);
    t.is(receiveDifferentClass(b), 100);
});
test('return either class', (t) => {
    t.is(returnEitherClass(1), 1);
    t.true(returnEitherClass(-1) instanceof JsClassForEither);
});
test('either from option', (t) => {
    t.true(eitherFromOption() instanceof JsClassForEither);
});
test('either from objects', (t) => {
    t.is(eitherFromObjects({ foo: 1 }), 'A');
    t.is(eitherFromObjects({ bar: 2 }), 'B');
    t.is(eitherFromObjects({ baz: 3 }), 'C');
});
test('either3', (t) => {
    t.is(either3(2), 2);
    t.is(either3('hello'), 'hello'.length);
    t.is(either3(true), 1);
    t.is(either3(false), 0);
});
test('either4', (t) => {
    t.is(either4(2), 2);
    t.is(either4('hello'), 'hello'.length);
    t.is(either4(true), 1);
    t.is(either4(false), 0);
    t.is(either4({ v: 1 }), 1);
    t.is(either4({ v: 'world' }), 'world'.length);
});
test('external', (t) => {
    const FX = 42;
    const ext = createExternal(FX);
    t.is(getExternal(ext), FX);
    mutateExternal(ext, FX + 1);
    t.is(getExternal(ext), FX + 1);
    // @ts-expect-error
    t.throws(() => getExternal({}));
    const ext2 = createExternalString('wtf');
    // @ts-expect-error
    const e = t.throws(() => getExternal(ext2));
    t.is(e.message, 'T on `get_value_external` is not the type of wrapped object');
});
const AbortSignalTest = typeof AbortController !== 'undefined' ? test : test.skip;
AbortSignalTest('async task without abort controller', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is(yield withoutAbortController(1, 2), 3);
}));
AbortSignalTest('async task with abort controller', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const ctrl = new AbortController();
    const promise = withAbortController(1, 2, ctrl.signal);
    try {
        ctrl.abort();
        yield promise;
        t.fail('Should throw AbortError');
    }
    catch (err) {
        t.is(err.message, 'AbortError');
    }
}));
AbortSignalTest('abort resolved task', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const ctrl = new AbortController();
    yield withAbortController(1, 2, ctrl.signal).then(() => ctrl.abort());
    t.pass('should not throw');
}));
const BigIntTest = typeof BigInt !== 'undefined' ? test : test.skip;
BigIntTest('BigInt add', (t) => {
    t.is(bigintAdd(BigInt(1), BigInt(2)), BigInt(3));
});
BigIntTest('create BigInt', (t) => {
    t.is(createBigInt(), BigInt('-3689348814741910323300'));
});
BigIntTest('create BigInt i64', (t) => {
    t.is(createBigIntI64(), BigInt(100));
});
BigIntTest('BigInt get_u64', (t) => {
    t.is(bigintGetU64AsString(BigInt(0)), '0');
});
BigIntTest('js mod test', (t) => {
    t.is(xxh64Alias(Buffer.from('hello world')), BigInt('1116'));
    t.is(xxh3.xxh3_64(Buffer.from('hello world')), BigInt('1116'));
    t.is(xxh3.xxh128(Buffer.from('hello world')), BigInt('1116'));
    t.is(xxh2.xxh2Plus(1, 2), 3);
    t.is(xxh2.xxh3Xxh64Alias(Buffer.from('hello world')), BigInt('1116'));
    t.is(xxh3.ALIGNMENT, 16);
    const xx3 = new xxh3.Xxh3();
    xx3.update(Buffer.from('hello world'));
    t.is(xx3.digest(), BigInt('1116'));
});
const Napi4Test = Number(process.versions.napi) >= 4 ? test : test.skip;
Napi4Test('call thread safe function', (t) => {
    let i = 0;
    let value = 0;
    return new Promise((resolve) => {
        callThreadsafeFunction((err, v) => {
            t.is(err, null);
            i++;
            value += v;
            if (i === 100) {
                resolve();
                t.is(value, Array.from({ length: 100 }, (_, i) => i + 1).reduce((a, b) => a + b));
            }
        });
    });
});
Napi4Test('throw error from thread safe function', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const throwPromise = new Promise((_, reject) => {
        threadsafeFunctionThrowError(reject);
    });
    const err = yield t.throwsAsync(throwPromise);
    t.is(err.message, 'ThrowFromNative');
}));
Napi4Test('thread safe function closure capture data', (t) => {
    return new Promise((resolve) => {
        threadsafeFunctionClosureCapture(() => {
            resolve();
            t.pass();
        });
    });
});
Napi4Test('resolve value from thread safe function fatal mode', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const tsfnFatalMode = new Promise((resolve) => {
        threadsafeFunctionFatalMode(resolve);
    });
    t.true(yield tsfnFatalMode);
}));
Napi4Test('throw error from thread safe function fatal mode', (t) => {
    var _a;
    const p = exec('node ./tsfn-error.js', {
        cwd: __dirname,
    });
    let stderr = Buffer.from([]);
    (_a = p.stderr) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
        stderr = Buffer.concat([stderr, Buffer.from(data)]);
    });
    return new Promise((resolve) => {
        p.on('exit', (code) => {
            t.is(code, 1);
            t.true(stderr
                .toString('utf8')
                .includes(`[Error: Generic tsfn error] { code: 'GenericFailure' }`));
            resolve();
        });
    });
});
Napi4Test('await Promise in rust', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fx = 20;
    const result = yield asyncPlus100(new Promise((resolve) => {
        setTimeout(() => resolve(fx), 50);
    }));
    t.is(result, fx + 100);
}));
Napi4Test('Run function which uses tokio internally but is not async', (t) => {
    useTokioWithoutAsync();
    // The prior didn't throw an exception, so it worked.
    t.assert(true);
});
Napi4Test('Promise should reject raw error in rust', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const fxError = new Error('What is Happy Planet');
    const err = yield t.throwsAsync(() => asyncPlus100(Promise.reject(fxError)));
    t.is(err, fxError);
}));
const Napi5Test = Number(process.versions.napi) >= 5 ? test : test.skip;
Napi5Test('Date test', (t) => {
    const fixture = new Date('2016-12-24');
    t.is(dateToNumber(fixture), fixture.valueOf());
});
Napi5Test('Date to chrono test', (t) => {
    const fixture = new Date('2022-02-09T19:31:55.396Z');
    t.is(chronoDateToMillis(fixture), fixture.getTime());
    t.deepEqual(chronoDateAdd1Minute(fixture), new Date(fixture.getTime() + 60 * 1000));
});
//# sourceMappingURL=values.spec.js.map