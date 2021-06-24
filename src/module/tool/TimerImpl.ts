import {Timer} from "./interface/Timer";
import {DiscordServer} from "../discord/DiscordServer";
import {ErrorDto} from "../../dto/ErrorDto";
import {TimerDto} from "../../dto/TimerDto";
import {CallTimerVo} from "../discord/CallTimerVo";
import {GuildMember, Snowflake} from "discord.js";
import {CommonDto} from "../../dto/CommonDto";
import {Member} from "../discord/Member";

export class TimerImpl implements Timer {
    addTimer(server: DiscordServer, channelId: string, owner: GuildMember, callMinute: number, callMemberString: string, sendText: string): TimerDto | ErrorDto {
        if (isNaN(callMinute)) {
            return new ErrorDto("분은 숫자만 입력가능합니다.");
        }
        
        if (callMinute > 1440 || 1 > callMinute) {
            return new ErrorDto("최소 1 ~ 1440분 까지 사용할 수 있습니다.");
        }

        const calledMemberList: Member[] = [];
        const registeredTimerLen = server.timerList.filter(value => value.caller.id === owner.user.id).length;

        if (registeredTimerLen >= 5) {
            return new ErrorDto("등록할 수 있는 타이머의 개수는 최대 5개입니다.");
        }

        server.memberList.forEach(member => {
            if (callMemberString.indexOf(member.name) != -1) {
                calledMemberList.push(member);
            }
        });

        if (calledMemberList.length == 0) {
            return new ErrorDto("호출 대상의 이름을 확인한 후 다시 입력해주세요");
        }

        const timerRank = Math.max(...server.timerList.map(timer => timer.rank)) != -Infinity ? Math.max(...server.timerList.map(member => member.rank)) + 1 : 1;

        const callUnixTime = new Date().getTime() + (callMinute * 60 * 1000);

        return new TimerDto(channelId, callUnixTime, new Member(owner), calledMemberList, timerRank, sendText);
    }

    getTimerList(server: DiscordServer): CallTimerVo[] {
        return server.timerList;
    }

    removeTimer(server: DiscordServer, ownerId: Snowflake, checkAdministrator: boolean, timerRank: number): CommonDto {
        if (isNaN(timerRank)) {
            return new ErrorDto("타이머취소는 숫자만 입력이 가능합니다.");
        }

        const callTimerList = server.timerList.filter(timer => timer.rank == timerRank);

        if (callTimerList.length === 0) {
            return new ErrorDto("타이머가 존재하지 않습니다.");
        }

        if (!(callTimerList[0].caller.id == ownerId || checkAdministrator)) {
            return new ErrorDto("타이머는 생성한 사람만 삭제할 수 있습니다.");
        }

        callTimerList.forEach((timer, index) => {
            server.timerList.splice(index, 1);
        });

        return new CommonDto(true);
    }
}