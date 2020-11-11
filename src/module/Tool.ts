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
import {HeeGunHoliday} from "./tool/interface/HeeGunHoliday";
import {HeeGunHolidayImpl} from "./tool/HeeGunHolidayImpl";
import {NamuWiki} from "./tool/interface/NamuWiki";
import {NamuWikiImpl} from "./tool/NamuWikiImpl";
import {YouTube} from "./tool/interface/Youtube";
import {YoutubeImpl} from "./tool/YoutubeImpl";
import {Timer} from "./tool/interface/Timer";
import {TimerImpl} from "./tool/TimerImpl";
import {Translation} from "./tool/interface/Translation";
import {TranslationImpl} from "./tool/TranslationImpl";

export class Tool {
    private readonly _corona: Corona;
    private readonly _exchange: Exchange;
    private readonly _system: System;
    private readonly _util: Util;
    private readonly _weather: Weather;
    private readonly _voiceLog: VoiceLog;
    private readonly _heeGunHoliday: HeeGunHoliday;
    private readonly _namuWiki: NamuWiki;
    private readonly _youtube: YouTube;
    private readonly _timer: Timer;
    private readonly _translation: Translation;

    constructor() {
        this._corona = new CoronaImpl();
        this._exchange = new ExchangeImpl();
        this._system = new SystemImpl();
        this._util = new UtilImpl();
        this._weather = new WeatherImpl();
        this._voiceLog = new VoiceLogImpl();
        this._heeGunHoliday = new HeeGunHolidayImpl();
        this._namuWiki = new NamuWikiImpl();
        this._youtube = new YoutubeImpl();
        this._timer = new TimerImpl();
        this._translation = new TranslationImpl();
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

    get heeGunHoliday(): HeeGunHoliday {
        return this._heeGunHoliday;
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
}