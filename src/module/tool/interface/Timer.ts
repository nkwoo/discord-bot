import {ErrorDto} from "../../../dto/ErrorDto";
import {DiscordServer} from "../../discord/DiscordServer";
import {TimerDto} from "../../../dto/TimerDto";
import {CallTimerVo} from "../../discord/CallTimerVo";
import {GuildMember, Snowflake} from "discord.js";
import {CommonDto} from "../../../dto/CommonDto";

export interface Timer {
    addTimer(server: DiscordServer, channelId: string, owner: GuildMember, callMinute: number, callMemberString: string, sendText: string): TimerDto | ErrorDto;
    getTimerList(server: DiscordServer): CallTimerVo[];
    removeTimer(server: DiscordServer, owner: Snowflake, checkAdministrator: boolean, timerRank: number): CommonDto;
}