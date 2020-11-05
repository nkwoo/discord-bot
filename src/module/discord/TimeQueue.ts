export class TimeQueue {
    private _timer: ReturnType<typeof setTimeout>;
    private _endTime: number;
    private _server: string;
    private _owner: string;
    private _rank: number;
    private _message: string;

    constructor(timer: ReturnType<typeof setTimeout>, endTime: number, server: string, owner: string, rank: number, message: string) {
        this._timer = timer;
        this._endTime = endTime;
        this._server = server;
        this._owner = owner;
        this._rank = rank;
        this._message = message;
    }

    get timer(): ReturnType<typeof setTimeout> {
        return this._timer;
    }

    set timer(value: ReturnType<typeof setTimeout>) {
        this._timer = value;
    }

    get endTime(): number {
        return this._endTime;
    }

    set endTime(value: number) {
        this._endTime = value;
    }

    get server(): string {
        return this._server;
    }

    set server(value: string) {
        this._server = value;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this._owner = value;
    }

    get rank(): number {
        return this._rank;
    }

    set rank(value: number) {
        this._rank = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }
}