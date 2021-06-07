import {CommonDto} from "./CommonDto";

export class MapleCharacterDto extends CommonDto {
    private _thumbnailUrl: string;
    private _nickname: string;
    private _job: string;
    private _worldRank: string;
    private _level: string;

    get thumbnailUrl(): string {
        return this._thumbnailUrl;
    }

    set thumbnailUrl(value: string) {
        this._thumbnailUrl = value;
    }

    get nickname(): string {
        return this._nickname;
    }

    set nickname(value: string) {
        this._nickname = value;
    }

    get job(): string {
        return this._job;
    }

    set job(value: string) {
        this._job = value;
    }

    get worldRank(): string {
        return this._worldRank;
    }

    set worldRank(value: string) {
        this._worldRank = value;
    }

    get level(): string {
        return this._level;
    }

    set level(value: string) {
        this._level = value;
    }
}