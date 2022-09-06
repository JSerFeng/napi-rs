import test from 'ava';
import { Fib, Fib2, Fib3 } from '../index';
for (const [index, factory] of [
    () => new Fib(),
    () => Fib2.create(0),
    () => new Fib3(0, 1),
].entries()) {
    test(`should be able to stop a generator #${index}`, (t) => {
        var _a;
        const fib = factory();
        const gen = fib[Symbol.iterator];
        t.is(typeof gen, 'function');
        const iterator = gen();
        t.deepEqual(iterator.next(), {
            done: false,
            value: 1,
        });
        iterator.next();
        iterator.next();
        iterator.next();
        iterator.next();
        t.deepEqual(iterator.next(), {
            done: false,
            value: 8,
        });
        t.deepEqual((_a = iterator.return) === null || _a === void 0 ? void 0 : _a.call(iterator), {
            done: true,
        });
        t.deepEqual(iterator.next(), {
            done: true,
        });
    });
    test(`should be able to throw to generator #${index}`, (t) => {
        const fib = factory();
        const gen = fib[Symbol.iterator];
        t.is(typeof gen, 'function');
        const iterator = gen();
        t.deepEqual(iterator.next(), {
            done: false,
            value: 1,
        });
        iterator.next();
        iterator.next();
        iterator.next();
        iterator.next();
        t.deepEqual(iterator.next(), {
            done: false,
            value: 8,
        });
        t.throws(() => iterator.throw(new Error()));
        t.deepEqual(iterator.next(), {
            done: true,
        });
    });
}
//# sourceMappingURL=generator.spec.js.map