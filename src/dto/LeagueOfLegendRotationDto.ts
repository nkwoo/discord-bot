import {CommonDto} from "./CommonDto";

export class LeagueOfLegendRotationDto extends CommonDto {
    private _freeChampions: string[];
    private _freeChampionsForBeginner: string[];

    constructor() {
        super();
        this.freeChampions = [];
        this.freeChampionsForBeginner = [];
    }

    get freeChampions(): string[] {
        return this._freeChampions;
    }

    set freeChampions(value: string[]) {
        this._freeChampions = value;
    }

    get freeChampionsForBeginner(): string[] {
        return this._freeChampionsForBeginner;
    }

    set freeChampionsForBeginner(value: string[]) {
        this._freeChampionsForBeginner = value;
    }
}