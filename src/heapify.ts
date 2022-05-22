
// this is just to make it clear that we are using a 1-based array; changing it to zero won't work without code changes
const ROOT_INDEX = 1;

type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array |
    Float32Array | Float64Array;

interface TypedArrayConstructor {
    new(capacity: number): TypedArray;
}

export class MinQueue {
    private readonly _capacity: number;
    private readonly _keys: TypedArray;
    private readonly _priorities: TypedArray;

    private length: number;
    private _hasPoppedElement: boolean;

    constructor(capacity = 64, keys: number[] = [], priorities: number[] = [],
        KeysBackingArrayType: TypedArrayConstructor = Uint32Array,
        PrioritiesBackingArrayType: TypedArrayConstructor = Uint32Array) {

        this._capacity = capacity;
        this._keys = new KeysBackingArrayType(capacity + ROOT_INDEX);
        this._priorities = new PrioritiesBackingArrayType(capacity + ROOT_INDEX);
        // to keep track of whether the first element is a deleted one
        this._hasPoppedElement = false;

        if (keys.length !== priorities.length) {
            throw new Error("Number of keys does not match number of priorities provided.");
        }
        if (capacity < keys.length) {
            throw new Error("Capacity less than number of provided keys.");
        }
        // copy data from user
        for (let i = 0; i < keys.length; i++) {
            this._keys[i + ROOT_INDEX] = keys[i];
            this._priorities[i + ROOT_INDEX] = priorities[i];
        }
        this.length = keys.length;
        for (let i = keys.length >>> 1; i >= ROOT_INDEX; i--) {
            this.bubbleDown(i);
        }
    }

    get capacity(): number {
        return this._capacity;
    }

    clear(): void {
        this.length = 0;
        this._hasPoppedElement = false;
    }

    /**
     * Bubble an item up until its heap property is satisfied.
     */
    private bubbleUp(index: number): void {
        const key = this._keys[index];
        const priority = this._priorities[index];

        while (index > ROOT_INDEX) {
            // get its parent item
            const parentIndex = index >>> 1;
            if (this._priorities[parentIndex] <= priority) {
                break;  // if parent priority is smaller, heap property is satisfied
            }
            // bubble parent down so the item can go up
            this._keys[index] = this._keys[parentIndex];
            this._priorities[index] = this._priorities[parentIndex];

            // repeat for the next level
            index = parentIndex;
        }

        // we finally found the place where the initial item should be; write it there
        this._keys[index] = key;
        this._priorities[index] = priority;
    }

    /**
     * Bubble an item down until its heap property is satisfied.
     */
    private bubbleDown(index: number): void {
        const key = this._keys[index];
        const priority = this._priorities[index];

        const halfLength = ROOT_INDEX + (this.length >>> 1);  // no need to check the last level
        const lastIndex = this.length + ROOT_INDEX;
        while (index < halfLength) {
            const left = index << 1;

            // pick the left child
            let childPriority = this._priorities[left];
            let childKey = this._keys[left];
            let childIndex = left;

            // if there's a right child, choose the child with the smallest priority
            const right = left + 1;
            if (right < lastIndex) {
                const rightPriority = this._priorities[right];
                if (rightPriority < childPriority) {
                    childPriority = rightPriority;
                    childKey = this._keys[right];
                    childIndex = right;
                }
            }

            if (childPriority >= priority) {
                break;  // if children have higher priority, heap property is satisfied
            }

            // bubble the child up to where the parent is
            this._keys[index] = childKey;
            this._priorities[index] = childPriority;

            // repeat for the next level
            index = childIndex;
        }

        // we finally found the place where the initial item should be; write it there
        this._keys[index] = key;
        this._priorities[index] = priority;
    }

    /**
     * @param key the identifier of the object to be pushed into the heap
     * @param priority the priority associated with the key
     */
    push(key: number, priority: number): void {
        if (this.length === this._capacity) {
            throw new Error("Heap has reached capacity, can't push new items");
        }

        if (this._hasPoppedElement) {
            // replace root element (which was deleted from the last pop)
            this._keys[ROOT_INDEX] = key;
            this._priorities[ROOT_INDEX] = priority;
            this.length++;
            this.bubbleDown(ROOT_INDEX);
            this._hasPoppedElement = false;
        } else {
            const pos = this.length + ROOT_INDEX;
            this._keys[pos] = key;
            this._priorities[pos] = priority;
            this.length++;
            this.bubbleUp(pos);
        }
    }

    /**
     * @return the key with the highest priority, or undefined if the heap is empty
     */
    pop(): number | undefined {
        if (this.length === 0) {
            return undefined;
        }
        this.removePoppedElement();

        this.length--;
        this._hasPoppedElement = true;

        return this._keys[ROOT_INDEX];
    }

    peekPriority(): number {
        this.removePoppedElement();
        return this._priorities[ROOT_INDEX];
    }

    peek(): number {
        this.removePoppedElement();
        return this._keys[ROOT_INDEX];
    }

    private removePoppedElement(): void {
        if (this._hasPoppedElement) {
            // since root element was already deleted from pop, replace with last and bubble down
            this._keys[ROOT_INDEX] = this._keys[this.length + ROOT_INDEX];
            this._priorities[ROOT_INDEX] = this._priorities[this.length + ROOT_INDEX];

            this.bubbleDown(ROOT_INDEX);
            this._hasPoppedElement = false;
        }
    }

    get size(): number {
        return this.length;
    }

    dumpRawPriorities(): string {
        this.removePoppedElement();

        const result = Array(this.length - ROOT_INDEX);
        for (let i = 0; i < this.length; i++) {
            result[i] = this._priorities[i + ROOT_INDEX];
        }
        return `[${result.join(" ")}]`;
    }
}
