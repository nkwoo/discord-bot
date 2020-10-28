export class Queue<T> {
    private _list: T[] = [];

    public getLength() {
        return this._list.length;
    }

    get list(): T[] {
        return this._list;
    }

    set list(value: T[]) {
        this._list = value;
    }

    public enqueue(item: T) {
        this._list.push(item);
    }

    public dequeue() {
        this._list.shift();
    }
}