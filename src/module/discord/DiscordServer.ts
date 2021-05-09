import {Queue} from "./Queue";
import {StreamDispatcher} from "discord.js";
import {YoutubeVideo} from "./YoutubeVideo";

export class DiscordServer {
    private _code: string;
    private _name: string;
    private _musicQueue: Queue<YoutubeVideo>;
    private _musicPlayer: StreamDispatcher | null;

    constructor(code: string, name: string) {
        this._code = code;
        this._name = name;
        this._musicQueue = new Queue<YoutubeVideo>();
        this._musicPlayer = null;
    }


    get code(): string {
        return this._code;
    }

    set code(value: string) {
        this._code = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get musicQueue(): Queue<YoutubeVideo> {
        return this._musicQueue;
    }

    set musicQueue(value: Queue<YoutubeVideo>) {
        this._musicQueue = value;
    }

    getMusicPlayer(): StreamDispatcher | null {
        return this._musicPlayer;
    }

    setMusicPlayer(value: StreamDispatcher): void {
        this._musicPlayer = value;
    }
}