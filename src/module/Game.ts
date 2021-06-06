import {Maple} from "./game/interface/Maple";
import {MapleImpl} from "./game/MapleImpl";
import {HtmlParser} from "./HtmlParser";

export class Game {
    private readonly _maple: Maple;

    constructor(private htmlParser: HtmlParser) {
        this._maple = new MapleImpl(this.htmlParser);
    }

    get maple(): Maple {
        return this._maple;
    }
}
