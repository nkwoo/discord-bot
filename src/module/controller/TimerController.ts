import {GlobalConfig} from "../../config/GlobalConfig";
import Discord from "discord.js";
import {DiscordServer} from "../discord/DiscordServer";
import {GlobalController} from "./GlobalController";
import {Member} from "../discord/Member";
import {CallTimerVo} from "../discord/CallTimerVo";

export class TimerController {

    constructor(private globalConfig: GlobalConfig, private globalController: GlobalController) {
    }

    callCommand(message: Discord.Message, command: string, args: string[]): void {
        const server = this.findServer(message);

        if (server != null) {
            switch (command) {
                case "타이머추가": {
                    if (args.length < 4 || message.content.indexOf("\"") === -1 || message.content.lastIndexOf("\"") === -1) {
                        message.channel.send(`${this.globalConfig.discord.prefix}타이머추가 <분> <호출대상> "<문구>" 형식대로 입력해주세요.`);
                        return;
                    }

                    const callMinute = Number(args[1]);
                    const calledMemberParameter = args[2];
                    const calledMemberList: Member[] = [];

                    if (isNaN(callMinute) || callMinute > 1440 || 1 > callMinute) {
                        message.channel.send("최소 1 ~ 1440분 까지 사용할 수 있습니다.");
                        return;
                    }

                    if (message.guild == null || message.member == null) {
                        message.channel.send("타이머를 사용할 수 없습니다.");
                        return;
                    }

                    const registeredTimerLen = server.timerList.filter(value => message.member ? value.caller.id === message.member.user.id : false).length;

                    if (registeredTimerLen >= 5) {
                        message.channel.send("등록할 수 있는 타이머의 개수는 최대 5개입니다.");
                        return;
                    }

                    server.memberList.forEach(member => {
                        if (calledMemberParameter.indexOf(member.name) != -1) {
                            calledMemberList.push(member);
                        }
                    });

                    if (calledMemberList.length == 0) {
                        message.channel.send("호출 대상의 이름을 확인한 후 다시 입력해주세요!");
                        return;
                    }

                    const timerRank = Math.max(...server.timerList.map(member => member.rank)) != -Infinity ? Math.max(...server.timerList.map(member => member.rank)) : 1;

                    const sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

                    const callUnixTime = new Date().getTime() + (callMinute * 60 * 1000);

                    const callTimerVo = new CallTimerVo(message.channel.id, callUnixTime, new Member(message.member), calledMemberList, timerRank, sendText);

                    server.timerList.push(callTimerVo);

                    message.channel.send({
                        embed: {
                            color: 3447003,
                            fields: [
                                {name: "타이머 호출대상", value: calledMemberList.map(member => member.name).join(", ")},
                                {name: "타이머 시간", value:  callMinute + "분"},
                                {name: "타이머 취소 방법", value: `${this.globalConfig.discord.prefix}타이머취소 ${timerRank}`}
                            ]
                        }
                    });

                    break;
                }
                case "타이머취소": {
                    if (args.length < 2) {
                        message.channel.send(`${this.globalConfig.discord.prefix}타이머취소 <타이머 번호> 형식대로 입력해주세요.`);
                        return;
                    }

                    const timerRank = Number(args[1]);

                    if (message.guild == null || message.member == null) {
                        message.channel.send("타이머를 사용할 수 없습니다.");
                        return;
                    }

                    const id = message.member.user.id;

                    server.timerList.filter(timer => timer.rank == timerRank).forEach((timer, index) => {
                        if (!(timer.caller.id == id || this.hasPermission(message))) {
                            message.channel.send("타이머는 생성한 사람만 삭제할 수 있습니다.");
                            return;
                        }

                        server.timerList.splice(index, 1);
                        message.channel.send("타이머가 취소되었습니다.");
                    });
                    break;
                }
                case "타이머": {
                    if (message.guild == null || message.member == null) {
                        message.channel.send("타이머를 사용할 수 없습니다.");
                        return;
                    }

                    if (server.timerList.length === 0) {
                        message.channel.send("등록된 타이머 정보가 없습니다.");
                        return;
                    }

                    const printDataArr: {name: string, value: string}[] = [];

                    server.timerList.forEach((timer) => {
                        printDataArr.push({
                            name: `순서 : ${timer.rank}`,
                            value: `호출대상 : ${timer.calledMembers.map(member => member.name).join(", ")} \n 종료 시간 : ${formatDate(timer.endTime)}`
                        });
                    });

                    message.channel.send({
                        embed: {
                            color: 3447003,
                            title: "타이머 리스트",
                            fields: printDataArr
                        }
                    });
                    break;
                }
            }
        }
    }

    private hasPermission(message: Discord.Message): boolean {
        return this.globalConfig.discord.administratorId.filter(value => message.member ? value === message.member.user.id : false).length > 0;
    }

    private findServer(message: Discord.Message): DiscordServer | null {
        const filterServer = this.globalController.getServerList().filter(value => message.guild ? value.id == message.guild.id : false);
        if (filterServer.length != 0) {
            return filterServer[0];
        } else {
            return null;
        }
    }
}

function formatDate(unixTime: number): string {
    const date = new Date(unixTime), year = date.getFullYear();
    let month = (date.getMonth() + 1).toString(),
        day = date.getDate().toString(),
        hour = date.getHours().toString(),
        minute = date.getMinutes().toString(),
        second = date.getSeconds().toString();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;
    if (second.length < 2) second = '0' + second;

    return `${[year, month, day].join("-")} ${[hour, minute, second].join(":")}`;
}