export class YoutubeVideo {
    private _url: string;
    private _time: string;
    private _title: string;
    private _state : boolean;

    constructor(url: string, time: string, title: string, state: boolean) {
        this._url = url;
        this._time = time;
        this._title = title;
        this._state = state;
    }


    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this._url = value;
    }

    get time(): string {
        return this._time;
    }

    set time(value: string) {
        this._time = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get state(): boolean {
        return this._state;
    }

    set state(value: boolean) {
        this._state = value;
    }
}