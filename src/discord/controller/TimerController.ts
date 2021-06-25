import {GlobalConfig} from "../../config/GlobalConfig";
import Discord from "discord.js";
import {DiscordServer} from "../vo/DiscordServer";
import {GlobalController} from "./GlobalController";
import {CallCommand} from "../enum/CallCommand";
import {Timer} from "../service/interface/Timer";
import {TimerImpl} from "../service/TimerImpl";
import {TimerDto} from "../dto/TimerDto";
import {CallTimer} from "../vo/CallTimer";

export class TimerController {
    private readonly timer: Timer;

    constructor(private globalConfig: GlobalConfig, private globalController: GlobalController) {
        this.timer = new TimerImpl();
    }

    callCommand(message: Discord.Message, command: CallCommand, args: string[]): void {
        const server = this.findServer(message);

        if (server != null) {
            if (message.guild == null || message.member == null) {
                message.channel.send("타이머를 사용할 수 없습니다.");
                return;
            }

            switch (command) {
                case CallCommand.TimerAdd: {
                    if (args.length < 4 || message.content.indexOf("\"") === -1 || message.content.lastIndexOf("\"") === -1) {
                        message.channel.send(`${this.globalConfig.discord.prefix}타이머추가 <분> <호출대상> "<문구>" 형식대로 입력해주세요.`);
                        return;
                    }

                    const sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

                    const timerDto = this.timer.addTimer(server, message.channel.id, message.member, Number(args[1]), args[2], sendText);

                    if (timerDto.state && timerDto instanceof TimerDto) {
                        server.timerList.push(new CallTimer(timerDto));

                        message.channel.send({
                            embed: {
                                color: 3447003,
                                fields: [
                                    {name: "타이머 호출대상", value: timerDto.calledMembers.map(member => member.name).join(", ")},
                                    {name: "타이머 시간", value:  Number(args[1]) + "분"},
                                    {name: "타이머 취소 방법", value: `${this.globalConfig.discord.prefix}타이머취소 ${timerDto.rank}`}
                                ]
                            }
                        });
                    } else {
                        message.channel.send(timerDto.message);
                    }

                    break;
                }
                case CallCommand.TimerList: {
                    const timerList = this.timer.getTimerList(server);

                    if (timerList.length === 0) {
                        message.channel.send("등록된 타이머 정보가 없습니다.");
                        return;
                    }

                    const printDataArr: {name: string, value: string}[] = [];

                    timerList.forEach((timer) => {
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
                case CallCommand.TimerRemove: {
                    if (args.length < 2) {
                        message.channel.send(`${this.globalConfig.discord.prefix}타이머취소 <타이머 번호> 형식대로 입력해주세요.`);
                        return;
                    }

                    const result = this.timer.removeTimer(server, message.member.user.id, this.hasPermission(message), Number(args[1]));

                    if (result.state) {
                        message.channel.send("타이머가 취소되었습니다.");
                    } else {
                        message.channel.send(result.message);
                    }
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