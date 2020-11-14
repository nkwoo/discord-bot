import {LeagueOfLegend} from "./game/interface/LeagueOfLegend";
import {LeagueOfLegendImpl} from "./game/LeagueOfLegendImpl";
import {Maple} from "./game/interface/Maple";
import {MapleImpl} from "./game/MapleImpl";
import {HtmlParser} from "./HtmlParser";

export class Game {
    private readonly _lol: LeagueOfLegend;
    private readonly _maple: Maple;

    constructor(private htmlParser: HtmlParser) {
        this._lol = new LeagueOfLegendImpl(this.htmlParser);
        this._maple = new MapleImpl(this.htmlParser);
    }

    get lol(): LeagueOfLegend {
        return this._lol;
    }

    get maple(): Maple {
        return this._maple;
    }
}
