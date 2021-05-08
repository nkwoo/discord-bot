import {Corona} from "./tool/interface/Corona";
import {CoronaImpl} from "./tool/CoronaImpl";
import {Exchange} from "./tool/interface/Exchange";
import {System} from "./tool/interface/System";
import {Util} from "./tool/interface/Util";
import {ExchangeImpl} from "./tool/ExchangeImpl";
import {SystemImpl} from "./tool/SystemImpl";
import {UtilImpl} from "./tool/UtilImpl";
import {Weather} from "./tool/interface/Weather";
import {WeatherImpl} from "./tool/WeatherImpl";
import {VoiceLog} from "./tool/interface/VoiceLog";
import {VoiceLogImpl} from "./tool/VoiceLogImpl";
import {NamuWiki} from "./tool/interface/NamuWiki";
import {NamuWikiImpl} from "./tool/NamuWikiImpl";
import {YouTube} from "./tool/interface/Youtube";
import {YoutubeImpl} from "./tool/YoutubeImpl";
import {Timer} from "./tool/interface/Timer";
import {TimerImpl} from "./tool/TimerImpl";
import {Translation} from "./tool/interface/Translation";
import {TranslationImpl} from "./tool/TranslationImpl";
import {HtmlParser} from "./HtmlParser";
import {GlobalConfig} from "../global/GlobalConfig";
import {Knou} from "./tool/interface/Knou";
import {KnouImpl} from "./tool/KnouImpl";

export class Tool {
    private readonly _corona: Corona;
    private readonly _exchange: Exchange;
    private readonly _system: System;
    private readonly _util: Util;
    private readonly _weather: Weather;
    private readonly _voiceLog: VoiceLog;
    private readonly _namuWiki: NamuWiki;
    private readonly _youtube: YouTube;
    private readonly _timer: Timer;
    private readonly _translation: Translation;
    private readonly _knou: Knou;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this._corona = new CoronaImpl(this.htmlParser);
        this._exchange = new ExchangeImpl(this.htmlParser);
        this._system = new SystemImpl();
        this._util = new UtilImpl();
        this._weather = new WeatherImpl(this.htmlParser);
        this._voiceLog = new VoiceLogImpl();
        this._namuWiki = new NamuWikiImpl(this.htmlParser);
        this._youtube = new YoutubeImpl();
        this._timer = new TimerImpl();
        this._translation = new TranslationImpl(this.htmlParser, globalConfig);
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

    get util(): Util {
        return this._util;
    }

    get weather(): Weather {
        return this._weather;
    }

    get voiceLog(): VoiceLog {
        return this._voiceLog;
    }

    get namuWiki(): NamuWiki {
        return this._namuWiki;
    }

    get youtube(): YouTube {
        return this._youtube;
    }

    get timer(): Timer {
        return this._timer;
    }

    get translation(): Translation {
        return this._translation;
    }

    get knou(): Knou {
        return this._knou;
    }
}