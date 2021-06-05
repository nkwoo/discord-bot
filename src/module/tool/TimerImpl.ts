import {Timer} from "./interface/Timer";
import {TimeQueue} from "../discord/TimeQueue";
import {Message} from "discord.js";
import {GlobalConfig} from "../../config/GlobalConfig";

export class TimerImpl implements Timer {

    constructor(private globalConfig: GlobalConfig) {
    }

    addTimer(message: Message, timerQueue: TimeQueue[], callUser: string, hour: number): void {
        const registeredTimerLen = timerQueue.filter(value => value.server === message.guild.id).filter(value => value.owner === message.member.user.id).length;
        if (registeredTimerLen >= 5) {
            message.channel.send("등록할 수 있는 타이머의 개수는 최대 5개입니다.");
            return;
        }

        const serverMembers = message.guild.members.filter(member => !member.user.bot);
        const callUsers: string[] = [];

        let sendMembers = "호출대상 : ";
        const sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

        serverMembers.forEach(function (member) {
            const matchMember = member.nickname != null ? member.nickname : member.user.username;

            if (matchMember.indexOf(callUser) != -1) {
                sendMembers += matchMember + ", ";
                callUsers.push(member.user.id);
            }
        });

        if (callUsers.length == 0) {
            message.channel.send("호출 대상의 이름을 확인한 후 다시 입력해주세요!");
            return;
        }

        message.channel.send({
            embed: {
                color: 3447003,
                fields: [
                    {name: "타이머 호출대상", value: sendMembers.substring(0, sendMembers.length - 2)},
                    {name: "타이머 시간", value:  hour + "분"},
                    {name: "타이머 취소 방법", value: `${this.globalConfig.discord.prefix}타이머취소 ${(timerQueue.length + 1)}`}
                ]
            }
        });

        let callUserStr = "";

        callUsers.forEach(function (id) {
            callUserStr += " <@!" + id + ">";
        });

        const timeout = setTimeout(function() {
            message.channel.send(sendText + callUserStr);
            timerQueue.filter(value => value.endTime < new Date().getTime()).forEach((value, index) => {
                clearTimeout(value.timer);
                timerQueue.splice(index, 1);
            });
        }, hour * 60 * 1000);

        timerQueue.push(new TimeQueue(timeout, new Date().getTime() + (hour * 60 * 1000), message.guild.id, message.member.user.id, timerQueue.filter(value => value.server === message.guild.id).length + 1,  sendText));
    }

    removeTimer(message: Message, timerQueue: TimeQueue[], inputRank: number): void {
        timerQueue.filter(value => value.server === message.guild.id).forEach(function (timeSch, idx) {
            if (timeSch.rank === inputRank) {
                if (timeSch.owner != message.member.user.id) {
                    message.channel.send("타이머는 생성한 사람만 삭제할 수 있습니다.");
                    return;
                }
                clearTimeout(timeSch.timer);
                timerQueue.splice(idx, 1);
                message.channel.send("타이머가 취소되었습니다.");
            }
        });
    }

    timerList(message: Message, timerQueue: TimeQueue[]): void {
        const printDataArr: {name: string, value: string}[] = [];

        const serverMembers = message.guild.members.filter(member => !member.user.bot);

        timerQueue.filter(value => value.server === message.guild.id).forEach((value) => {

            let userName = "";

            serverMembers.filter(member => member.id === value.owner).forEach(user => {
                userName = user.nickname != null ? user.nickname : user.displayName;
            })

            printDataArr.push({
                name: `Rank - ${value.rank}`,
                value: `호출대상 : ${userName}
                종료 시간 : ${formatDate(value.endTime, "-")}`
            });
        });

        message.channel.send({
            embed: {
                color: 3447003,
                title: "타이머 리스트",
                fields: printDataArr
            }
        });
    }
}

function formatDate(date: number, prefix: string): string {
    const d = new Date(date),
        year = d.getFullYear();
    let month = '' + (d.getMonth() + 1),
        day = '' + d.getDate();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join(prefix);
}