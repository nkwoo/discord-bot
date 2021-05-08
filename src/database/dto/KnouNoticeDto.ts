export class KnouNoticeDto {
    private _boardIdx: number;
    private _title: string;
    private _writeDate: string;
    private _postLink: string;

    constructor(boardIdx: number, title: string, writeDate: string, postLink: string) {
        this._boardIdx = boardIdx;
        this._title = title;
        this._writeDate = writeDate;
        this._postLink = postLink;
    }

    get boardIdx(): number {
        return this._boardIdx;
    }

    set boardIdx(value: number) {
        this._boardIdx = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get writeDate(): string {
        return this._writeDate;
    }

    set writeDate(value: string) {
        this._writeDate = value;
    }

    get postLink(): string {
        return this._postLink;
    }

    set postLink(value: string) {
        this._postLink = value;
    }
}