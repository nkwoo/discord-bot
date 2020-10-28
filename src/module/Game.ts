import {LeagueOfLegend} from "./game/interface/LeagueOfLegend";
import {LeagueOfLegendImpl} from "./game/LeagueOfLegendImpl";
import {Maple} from "./game/interface/Maple";
import {MapleImpl} from "./game/MapleImpl";

export class Game {
    private readonly _lol: LeagueOfLegend;
    private readonly _maple: Maple;

    constructor() {
        this._lol = new LeagueOfLegendImpl();
        this._maple = new MapleImpl();
    }

    get lol(): LeagueOfLegend {
        return this._lol;
    }

    get maple(): Maple {
        return this._maple;
    }
}
