import {Corona} from "./interface/Corona";
import {CoronaImpl} from "./CoronaImpl";
import {Exchange} from "./interface/Exchange";
import {System} from "./interface/System";
import {ExchangeImpl} from "./ExchangeImpl";
import {SystemImpl} from "./SystemImpl";
import {Weather} from "./interface/Weather";
import {WeatherImpl} from "./WeatherImpl";
import {NamuWiki} from "./interface/NamuWiki";
import {NamuWikiImpl} from "./NamuWikiImpl";
import {Translation} from "./interface/Translation";
import {TranslationImpl} from "./TranslationImpl";
import {HtmlParser} from "../../global/HtmlParser";
import {GlobalConfig} from "../../config/GlobalConfig";
import {Knou} from "./interface/Knou";
import {KnouImpl} from "./KnouImpl";

export class Tool {
    private readonly _corona: Corona;
    private readonly _exchange: Exchange;
    private readonly _system: System;
    private readonly _weather: Weather;
    private readonly _namuWiki: NamuWiki;
    private readonly _translation: Translation;
    private readonly _knou: Knou;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this._corona = new CoronaImpl(this.htmlParser);
        this._exchange = new ExchangeImpl(this.htmlParser);
        this._system = new SystemImpl();
        this._weather = new WeatherImpl(this.htmlParser);
        this._namuWiki = new NamuWikiImpl(this.htmlParser);
        this._translation = new TranslationImpl(this.htmlParser, this.globalConfig);
        this._knou = new KnouImpl(this.htmlParser);
    }

    get corona(): Corona {
        return this._corona;
    }

    get exchange(): Exchange {
        return this._exchange;
    }

    get system(): System {
        return this._system;
    }

    get weather(): Weather {
        return this._weather;
    }

    get namuWiki(): NamuWiki {
        return this._namuWiki;
    }

    get translation(): Translation {
        return this._translation;
    }

    get knou(): Knou {
        return this._knou;
    }
}