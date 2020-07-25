
import assert from "assert";
import Heapify from "../heapify.mjs";
import mocha from "mocha";

const {describe, it} = mocha;

/* eslint-disable max-lines-per-function */
describe("Heapify", () => {
    /* eslint-enable max-lines-per-function */

    it("should create a priority queue", () => {
        const queue = new Heapify();
        assert(queue instanceof Heapify);
    });

    it("should have a default capacity", () => {
        const queue = new Heapify();
        assert.strictEqual(queue.capacity, 64);
    });

    it("should create a priority queue with a specified capacity", () => {
        const queue = new Heapify(123);
        assert.strictEqual(queue.capacity, 123);
        assert.strictEqual(queue.size, 0);
    });

    it("should create a priority queue with given keys and priorities", () => {
        const queue = new Heapify(100, [1, 2], [50, 1]);
        assert.strictEqual(queue.size, 2);
        const key = queue.peek();
        assert.strictEqual(key, 2);
    });

    it("should only create a priority queue with same number of keys and priorities", () => {
        assert.throws(() => new Heapify(30, [1, 2], [3, 4, 5]));
    });

    it("should only create a priority queue with enough capacity", () => {
        assert.throws(() => new Heapify(1, [1, 2], [50, 1]));
    });

    it("should be able to push new items", () => {
        const queue = new Heapify();
        assert.strictEqual(queue.size, 0);
        queue.push(1, 10);
        assert.strictEqual(queue.size, 1);
    });

    it("should not be able to push new items over capacity", () => {
        const queue = new Heapify(1);
        assert.strictEqual(queue.size, 0);
        queue.push(1, 10);
        assert.strictEqual(queue.size, 1);
        assert.throws(() => queue.push(2, 20));
        assert.strictEqual(queue.size, 1);
    });

    it("should be able to pop an item", () => {
        const queue = new Heapify();
        queue.push(123, 456);
        assert.strictEqual(queue.size, 1);
        const key = queue.pop();
        assert.strictEqual(queue.size, 0);
        assert.strictEqual(key, 123);
    });

    it("should pop undefined when queue is empty", () => {
        const queue = new Heapify();
        assert.strictEqual(queue.pop(), undefined);
    });

    it("should be able to peek an item", () => {
        const queue = new Heapify();
        queue.push(123, 456);
        assert.strictEqual(queue.size, 1);
        const key = queue.peek();
        assert.strictEqual(queue.size, 1);
        assert.strictEqual(key, 123);
    });

    it("should be able to peek the priority of an item", () => {
        const queue = new Heapify();
        queue.push(123, 456);
        assert.strictEqual(queue.size, 1);
        const priority = queue.peekPriority();
        assert.strictEqual(queue.size, 1);
        assert.strictEqual(priority, 456);
    });

    it("should support 32-bit keys", () => {
        const VALID_32BIT_KEY = 2 ** 32 - 1;  // greatest 32-bit value
        const INVALID_32BIT_KEY = VALID_32BIT_KEY + 1;

        const queue = new Heapify();

        queue.push(VALID_32BIT_KEY, 456);
        const key1 = queue.pop();
        assert.strictEqual(key1, VALID_32BIT_KEY);

        /*
         * let's make sure it's passing for the right reason
         * 2**32 should truncate the 33rd bit and return 0
         */
        queue.push(INVALID_32BIT_KEY, 456);
        const key2 = queue.pop();
        assert.strictEqual(key2, 0);
    });

    it("should support 32-bit priorities", () => {
        const VALID_32BIT_PRIORITY = 2 ** 32 - 1;  // greatest 32-bit value
        const INVALID_32BIT_PRIORITY = VALID_32BIT_PRIORITY + 1;

        const queue = new Heapify();

        queue.push(123, VALID_32BIT_PRIORITY);
        const priority1 = queue.peekPriority();
        assert.strictEqual(priority1, VALID_32BIT_PRIORITY);

        queue.clear();

        /*
         * let's make sure it's passing for the right reason
         * 2**32 should truncate the 33rd bit and return 0
         */
        queue.push(123, INVALID_32BIT_PRIORITY);
        const priority2 = queue.peekPriority();
        assert.strictEqual(priority2, 0);
    });

    it("should dump priorities", () => {
        const queue = new Heapify();
        queue.push(1, 10);
        queue.push(2, 20);
        queue.push(3, 30);
        assert.strictEqual(queue.toString(), "[10 20 30]");
    });

    it("should correctly pop root and then its child", () => {
        // this triggers the logic that moves a child to the top, but still without any bubbling to fix the heap
        const queue = new Heapify();
        queue.push(1, 10);
        queue.push(2, 20);
        assert.strictEqual(queue.pop(), 1);
        assert.strictEqual(queue.pop(), 2);
    });

    it("should correctly bubble down to the left after pop", () => {
        // similar to the previous test, but now we need an item to be bubbled down after the first item is removed
        const queue = new Heapify();

        /*
         *       10
         *     20  30
         *   40
         */
        queue.push(1, 10);
        queue.push(2, 20);
        queue.push(3, 30);
        queue.push(4, 40);
        assert.strictEqual(queue.toString(), "[10 20 30 40]");

        /*
         * removing 10, now 40 is moved to the top and needs to be bubbled down
         * and we should now be triggering that logic
         */
        queue.pop();
        assert.strictEqual(queue.toString(), "[20 40 30]");
    });

    it("should correctly bubble down to the right after pop", () => {
        // similar to the previous test, but now we need an item to be bubbled down to the right
        const queue = new Heapify();

        /*
         *       10
         *     30  20
         *   40
         */
        queue.push(1, 10);
        queue.push(2, 30);
        queue.push(3, 20);
        queue.push(4, 40);
        assert.strictEqual(queue.toString(), "[10 30 20 40]");

        /*
         * removing 10, now 40 is moved to the top and needs to be bubbled down,
         * but this time we'll trigger the logic that moves it to the right
         */
        queue.pop();
        assert.strictEqual(queue.toString(), "[20 30 40]");
    });

    it("should correctly bubble down after pop, but stopping before a leaf", () => {

        /*
         * similar to the previous test, but now we need an item to be bubbled
         * down to the left and stop somewhere before reaching a leaf, so we
         * can test the logic that evaluates and to stop bubbling
         */
        const queue = new Heapify();

        /*
         *         10
         *     20      30
         *   40  35
         */
        queue.push(1, 10);
        queue.push(2, 20);
        queue.push(3, 30);
        queue.push(4, 40);
        queue.push(5, 35);
        assert.strictEqual(queue.toString(), "[10 20 30 40 35]");

        /*
         * removing 10, now 35 is moved to the top and needs to be bubbled down,
         * but it should only goes as far as the second level
         */
        queue.pop();
        assert.strictEqual(queue.toString(), "[20 35 30 40]");
    });

    it("should correctly bubble up when inserting a higher priority item in a non-empty queue", () => {
        const queue = new Heapify();

        queue.push(1, 20);
        // now we insert a higher priority and it should bubble to the top
        queue.push(2, 10);
        assert.strictEqual(queue.toString(), "[10 20]");
    });

    it("should be possible to use this as an iterator and get [key, priority] tuples", () => {
        const queue = new Heapify();
        queue.push(5, 35);
        queue.push(3, 30);
        queue.push(1, 10);
        queue.push(2, 20);
        queue.push(4, 40);

        assert.deepStrictEqual([...queue], [[1, 10], [2, 20], [3, 30], [5, 35], [4, 40]]);
    });

    it("should be possible to iterate over all the keys", () => {
        const queue = new Heapify();
        queue.push(5, 35);
        queue.push(3, 30);
        queue.push(1, 10);
        queue.push(2, 20);
        queue.push(4, 40);

        assert.deepStrictEqual([...queue.keys()], [1, 2, 3, 5, 4]);
    });

    it("should be possible to iterate over all the priorities", () => {
        const queue = new Heapify();
        queue.push(5, 35);
        queue.push(3, 30);
        queue.push(1, 10);
        queue.push(2, 20);
        queue.push(4, 40);

        assert.deepStrictEqual([...queue.priorities()], [10, 20, 30, 35, 40]);
    });

    it("should return [object Heapify] when stringified", () => {
        const queue = new Heapify();
        assert.strictEqual(Object.prototype.toString.call(queue), "[object Heapify]");
    });

    it("should return '(empty queue)' when stringifying an empty queue", () => {
        const queue = new Heapify();
        assert.strictEqual(String(queue), "(empty queue)");
    });

    it("should pushPop correctly when new priority is smaller than min", () => {
        const queue = new Heapify();
        queue.push(1, 20);
        const popped = queue.pushPop(2, 10);
        
        assert.strictEqual(popped, 2);
        assert.strictEqual(queue.toString(), "[20]");
    });

    it("should pushPop correctly when new priority is larger than min", () => {
        const queue = new Heapify();
        queue.push(1, 10);
        const popped = queue.pushPop(2, 20);
        
        assert.strictEqual(popped, 1);
        assert.strictEqual(queue.toString(), "[20]");
    });

    it("should have consistent behavior on pushPop when priority is equal to min", () => {
        const queue1 = new Heapify();
        queue1.push(1, 10);
        const popped1 = queue1.pushPop(2, 10);
        const peek1 = queue1.peek();

        const queue2 = new Heapify();
        queue2.push(1, 10);
        queue2.push(2, 10);
        const popped2 = queue2.pop();
        const peek2 = queue2.peek();
        assert.strictEqual(popped1, popped2);
        assert.strictEqual(peek1, peek2);
    });

    it("should pushPop correctly when new queue is empty", () => {
        const queue = new Heapify();
        const popped = queue.pushPop(1, 10);

        assert.strictEqual(popped, 1);
        assert.strictEqual(queue.size, 0);
    });

    it("should not be able to pushPop new items over capacity", () => {
        const queue = new Heapify(1);
        assert.strictEqual(queue.size, 0);
        queue.push(1, 10);
        assert.strictEqual(queue.size, 1);
        assert.throws(() => queue.pushPop(2, 20));
        assert.strictEqual(queue.size, 1);
    });

    it("should popPush correctly when new priority is larger than min", () => {
        const queue = new Heapify();
        queue.push(1, 20);
        const popped = queue.popPush(2, 10);
        
        assert.strictEqual(popped, 1);
        assert.strictEqual(queue.toString(), "[10]");
    });

    it("should have consistent behavior on popPush when priority is equal to min", () => {
        const queue1 = new Heapify();
        queue1.push(1, 10);
        const popped1 = queue1.popPush(2, 10);
        const peek1 = queue1.peek();

        const queue2 = new Heapify();
        queue2.push(1, 10);
        const popped2 = queue2.pop();
        queue2.push(2, 10);
        const peek2 = queue2.peek();
        assert.strictEqual(popped1, popped2);
        assert.strictEqual(peek1, peek2);
    });

    it("should popPush correctly when new queue is empty", () => {
        const queue = new Heapify();
        const popped = queue.popPush(1, 10);

        assert.strictEqual(popped, undefined);
        assert.strictEqual(queue.peek(), 1);
    });

    it("should be able to popPush when items at capacity", () => {
        const queue = new Heapify(2);
        queue.push(1, 3);
        queue.push(2, 5);
        
        const popped = queue.popPush(3, 4);

        assert.strictEqual(popped, 1);
        assert.strictEqual(queue.size, 2);
        assert.strictEqual(queue.toString(), "[4 5]");
    });
});
