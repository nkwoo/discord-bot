import {ErrorDto} from "../../dto/ErrorDto";
import {DiscordServer} from "../../vo/DiscordServer";
import {TimerDto} from "../../dto/TimerDto";
import {GuildMember, Snowflake} from "discord.js";
import {CommonDto} from "../../dto/CommonDto";
import {CallTimer} from "../../vo/CallTimer";

export interface Timer {
    addTimer(server: DiscordServer, channelId: string, owner: GuildMember, callMinute: number, callMemberString: string, sendText: string): TimerDto | ErrorDto;
    getTimerList(server: DiscordServer): CallTimer[];
    removeTimer(server: DiscordServer, owner: Snowflake, checkAdministrator: boolean, timerRank: number): CommonDto;
}