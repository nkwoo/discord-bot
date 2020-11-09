import * as Discord from "discord.js";
//https://github.com/fent/node-ytdl-core#usage
import * as dotenv from "dotenv";
import * as fs from "fs";

import {Tool} from "./module/Tool";
import {Game} from "./module/Game";
import {TimeQueue} from "./module/discord/TimeQueue";
import {DiscordServer} from "./module/discord/DiscordServer";

const client = new Discord.Client();

const discordServer: DiscordServer[] = [];
const timerQueue: TimeQueue[] = [];

const tool = new Tool();
const game = new Game();

const administratorUserId = ["356423613605478401"];
const botDevId = "682174735169486868";


let envPath;
switch (process.env.NODE_ENV) {
    case "prod":
        envPath = "./.env.prod";
        break;
    case "dev":
        envPath = "./.env.dev";
        break;
    default:
        envPath = "./.env.dev";
        break;
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

/**
* 유저 권한 체크
*/
function permission(message: Discord.Message): boolean {
    const id = message.member.user.id;
    for (let i = 0; i < administratorUserId.length; i++) {
        if (administratorUserId[i] == id) return false;
    }

    message.channel.send("권한이 없습니다.");

    return true;
}

client.on("ready", () => {
    console.log(`Server Ready - now Runing: ${process.env.NODE_ENV != undefined ? process.env.NODE_ENV : "dev"}`);

    client.guilds.forEach((value, index) => discordServer.push(new DiscordServer(index, value.name)));
});

client.on("error", () => {
    console.error();
});

client.on("voiceStateUpdate", (oldMember, newMember) => {
    const newUserChannel = newMember.voiceChannel;
    const oldUserChannel = oldMember.voiceChannel;

    //로그는 서버/채널/닉네임 순

    if (oldUserChannel === undefined) {
        tool.voiceLog.voiceLogRecorder(`${newUserChannel.guild.name}/${newUserChannel.name}/${newMember.nickname}님 입장`);
    } else if (newUserChannel === undefined) {
        tool.voiceLog.voiceLogRecorder(`${oldUserChannel.guild.name}/${oldUserChannel.name}/${oldMember.nickname}님 퇴장`);
    } else if (oldUserChannel != undefined && newUserChannel != undefined) {
        tool.voiceLog.voiceLogRecorder(`${oldUserChannel.guild.name}/${oldUserChannel.name}/${oldMember.nickname} 에서 ${newUserChannel.guild.name}/${newUserChannel.name}/${newMember.nickname}'로 이동함`);
    }
});

client.on("message", message => {

    if (message.member.user.bot) return;

    const server = discordServer.filter(value => value.code == message.guild.id)[0];

    const args = message.content.split(" ");

    if (process.env.NODE_ENV == "prod") {
        const checkDevOn = message.guild.members.filter(function(el) {
            return el.user.id == botDevId &&
            el.user.presence.status == "online";
        }).array().length;

        if (checkDevOn > 0) {
            return;
        }
    }

    switch (args[0].toLowerCase()) {
        case "!재생": {
            if (permission(message)) return;

            if (!args[1]) {
                message.channel.send("!재생 <유툽주소> ㄱㄱ");
                return;
            }

            tool.youtube.addYoutube(message, server, args[1]);
            break;
        }
        case "!소리": {
            if (permission(message)) return;

            tool.youtube.setYoutubeVolumeControl(message.channel, server.getMusicPlayer(), args[1]);
            break;
        }
        case "!일시정지": {
            if (permission(message)) return;

            tool.youtube.pauseYoutubePlayer(message.channel, server.getMusicPlayer());
            break;
        }
        case "!스킵": {
            if (permission(message)) return;

            tool.youtube.skipYoutubeVideo(server.getMusicPlayer());
            break;
        }
        case "!목록": {
            if (permission(message)) return;

            tool.youtube.getPlayList(message.channel, server.musicQueue.list);
            break;
        }
        case "!종료": {
            if (permission(message)) return;

            server.musicQueue.list = [];

            tool.youtube.stopPlayer(message);
            break;
        }
        case "!롤": {
            if (permission(message)) return;

            if (message.content.length < 3) {
                message.channel.send("!롤 <닉네임> ㄱㄱ");
                return;
            }

            const nickname = message.content.substring(3, message.content.length).trim();

            game.lol.searchLoLPlayData(message.channel, nickname);

            break;
        }
        case "!희건": {
            tool.heeGunHoliday.checkHeeKunHoliday(message.channel, args[1] != null ? args[1] : "1");
            break;
        }
        case "!날씨": {
            tool.weather.getSeoulWeather(message.channel);
            break;
        }
        case "!메이플": {
            if (message.content.length < 3) {
                message.channel.send("!메이플 <닉네임> ㄱㄱ");
                return;
            }

            const nickname = encodeURIComponent(message.content.substring(5, message.content.length).trim());

            game.maple.searchMaplePlayerData(message.channel, nickname, 0);

            break;
        }
        case "!타이머추가": {
            const commandHour = Number(args[1]);

            if (message.content.length < 5 || isNaN(commandHour) || args.length < 4 || message.content.indexOf("\"") == -1) {
                message.channel.send("!타이머추가 <분> <호출대상> \"<문구>\"ㄱㄱ");
                return;
            }

            if (commandHour > 1440 || 1 > commandHour) {
                message.channel.send("최소 1 ~ 1440분 까지 사용할 수 있습니다.");
                return;
            }

            tool.timer.addTimer(message, timerQueue, args[2], commandHour);
            break;
        }
        case "!타이머취소": {
            if (message.content.length < 5 || args.length < 2) {
                message.channel.send("!타이머취소 <타이머 번호> ㄱㄱ");
                return;
            }
            
            tool.timer.removeTimer(message, timerQueue, Number(args[1]));
            break;
        }
        case "!타이머": {
            if (permission(message)) return;

            tool.timer.timerList(message, timerQueue);
            break;
        }
        case "!상태": {
            tool.system.getSystemState(message.channel);
            break;
        }
        case "!엔화": {
            tool.exchange.getExchangeWonToJpy(message.channel);
            break;
        }
        case "!코로나": {
            tool.corona.getCoronaState(message.channel);
            break;
        }
        case "!나무랭킹": {
            tool.namuWiki.getNamuRanking(message.channel);
            break;
        }
        case "!명령어": {
            const printDataArr: {name: string; value: string;}[] = [];

            printDataArr.push({name: "!롤 <닉네임>", value: "롤전적 검색"});
            printDataArr.push({name: "!희건 <오늘 부터 조회할 날짜 수> 또는 <조회하고 싶은 당일 (YYYYMMDD)>", value: "오늘이 야간,주간,휴일 인지 조회"});
            printDataArr.push({name: "!메이플 <닉네임>", value: "메이플 정보 검색"});
            printDataArr.push({name: "!날씨", value: "서울시 날씨 데이터를 조회"});
            printDataArr.push({name: "!타이머추가 <분> <호출대상> \"<문구>\"", value: "호출대상을 지정하고 입력하면 입력한 시간에 따라 이용자 호출"});
            printDataArr.push({name: "!타이머취소 <타이머코드>", value: "타이머취소 방법"});
            printDataArr.push({name: "!엔화", value: "엔화 가격 조회"});
            printDataArr.push({name: "!코로나", value: "코로나 현황 조회"});
            printDataArr.push({name: "!나무랭킹", value: "나무위키 검색 랭킹 조회"});

            message.channel.send({
                embed: {
                    color: 3447003,
                    fields: printDataArr
                }
            });
            break;
        }
    }
});

if (process.env.DISCORD_API_KEY) {
    client.login(process.env.DISCORD_API_KEY);
} else {
    console.log("You Don't Have Api-Key go https://discordapp.com/developers/applications/");
}