export class CommonDto {
    private _state: boolean;
    private _message: string;

    constructor(state: boolean) {
        this._state = state;
    }

    get state(): boolean {
        return this._state;
    }

    set state(value: boolean) {
        this._state = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }
}