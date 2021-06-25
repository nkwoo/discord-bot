import {CommonDto} from "./CommonDto";

export class LeagueOfLegendUserDto extends CommonDto {
    private _username: string;
    private _level: number;
    private _thumbnailIconUrl: string;
    private _soloRank: string;
    private _freeRank: string;
    private _inGameStatus: string;
    private _lastPlayChampions: string[];


    constructor() {
        super(true);
        this.soloRank = "랭크 기록 없음";
        this.freeRank = "랭크 기록 없음";
        this.inGameStatus = "현재 게임중이 아닙니다.";
        this.lastPlayChampions = [];
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get level(): number {
        return this._level;
    }

    set level(value: number) {
        this._level = value;
    }

    get thumbnailIconUrl(): string {
        return this._thumbnailIconUrl;
    }

    set thumbnailIconUrl(value: string) {
        this._thumbnailIconUrl = value;
    }

    get soloRank(): string {
        return this._soloRank;
    }

    set soloRank(value: string) {
        this._soloRank = value;
    }

    get freeRank(): string {
        return this._freeRank;
    }

    set freeRank(value: string) {
        this._freeRank = value;
    }

    get inGameStatus(): string {
        return this._inGameStatus;
    }

    set inGameStatus(value: string) {
        this._inGameStatus = value;
    }

    get lastPlayChampions(): string[] {
        return this._lastPlayChampions;
    }

    set lastPlayChampions(value: string[]) {
        this._lastPlayChampions = value;
    }
}