import {Member} from "./Member";
import {TimerDto} from "../dto/TimerDto";

export class CallTimer {
    private _channel: string;
    private _endTime: number;
    private _caller: Member;
    private _calledMembers: Member[];
    private _rank: number;
    private _message: string;

    constructor(timerDto: TimerDto) {
        this._channel = timerDto.channel;
        this._endTime = timerDto.endTime;
        this._caller = timerDto.caller;
        this._calledMembers = timerDto.calledMembers;
        this._rank = timerDto.rank;
        this._message = timerDto.message;
    }

    get channel(): string {
        return this._channel;
    }

    set channel(value: string) {
        this._channel = value;
    }

    get endTime(): number {
        return this._endTime;
    }

    set endTime(value: number) {
        this._endTime = value;
    }

    get caller(): Member {
        return this._caller;
    }

    set caller(value: Member) {
        this._caller = value;
    }

    get calledMembers(): Member[] {
        return this._calledMembers;
    }

    set calledMembers(value: Member[]) {
        this._calledMembers = value;
    }

    get rank(): number {
        return this._rank;
    }

    set rank(value: number) {
        this._rank = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }
}