import * as Discord from "discord.js";
import * as fs from "fs";

import {Tool} from "./module/Tool";
import {Game} from "./module/Game";
import {TimeQueue} from "./module/discord/TimeQueue";
import {DiscordServer} from "./module/discord/DiscordServer";
import {HtmlParser} from "./module/HtmlParser";
import {GlobalConfig} from "./global/GlobalConfig";

import {createConnection} from "typeorm";
import {VoiceLogType} from "./enum/VoiceLogType";
import {VoiceLogService} from "./database/service/VoiceLogService";

const discordServer: DiscordServer[] = [];
const timerQueue: TimeQueue[] = [];

let configPath;
switch (process.env.NODE_ENV) {
    case "prod":
        configPath = "./env/prod.json";
        break;
    case "dev":
        configPath = "./env/dev.json";
        break;
    default:
        configPath = "./env/dev.json";
        break;
}

const globalConfig: GlobalConfig = JSON.parse(fs.readFileSync(configPath).toString());

const htmlParser = new HtmlParser();

const tool = new Tool(htmlParser, globalConfig);
const game = new Game(htmlParser, globalConfig);

console.log(process.env.NODE_ENV);

/**
 * 유저 권한 체크
 */
function permission(message: Discord.Message): boolean {
    const id = message.member.user.id;
    for (let i = 0; i < globalConfig.administratorId.length; i++) {
        if (globalConfig.administratorId[i] == id) return false;
    }

    message.channel.send("권한이 없습니다.");

    return true;
}

function compareVoiceChannel(oldChannel: Discord.VoiceChannel, newChannel: Discord.VoiceChannel): boolean {
    return oldChannel.guild !== undefined && newChannel.guild !== undefined ? oldChannel.guild.name === newChannel.guild.name && oldChannel.name === newChannel.name : false;
}

createConnection({
    "type": "mysql",
    "host": process.env.NODE_ENV == "prod" ? "mariadb" : "192.168.100.2",
    "port": process.env.NODE_ENV == "prod" ? 3306 : 9986,
    "username": "bot",
    "password": "1234",
    "database": "bot",
    "synchronize": true,
    "logging": false,
    "entities": [
        "src/database/entity/**/*.ts"
    ]
}).then(async connection => {

    const voiceLogService = new VoiceLogService(connection);

    const client = new Discord.Client();

    client.on("ready", () => {
        console.log(`Server Ready - now Running: ${process.env.NODE_ENV != undefined ? process.env.NODE_ENV : "dev"}`);

        client.guilds.forEach((value, index) => discordServer.push(new DiscordServer(index, value.name)));
    });

    client.on("error", () => {
        console.error();
    });

    client.on("voiceStateUpdate", (oldMember, newMember) => {
        const newUserChannel = newMember.voiceChannel;
        const oldUserChannel = oldMember.voiceChannel;

        if (oldUserChannel === undefined) {
            if (newUserChannel !== undefined && newUserChannel.guild !== undefined) {
                voiceLogService.record(newUserChannel.guild.name, newUserChannel.name, newMember.nickname != null ? newMember.nickname : newMember.displayName, VoiceLogType.IN);
            }
        } else if (newUserChannel === undefined) {
            if (oldUserChannel.guild !== undefined) {
                voiceLogService.record(oldUserChannel.guild.name, oldUserChannel.name, oldMember.nickname != null ? oldMember.nickname : oldMember.displayName, VoiceLogType.OUT);
            }
        } else if (oldUserChannel != undefined && newUserChannel != undefined) {
            if (!compareVoiceChannel(oldUserChannel, newUserChannel)) {
                voiceLogService.record(oldUserChannel.guild.name, oldUserChannel.name, oldMember.nickname != null ? oldMember.nickname : oldMember.displayName, VoiceLogType.MOVE, `${newUserChannel.guild.name} / ${newUserChannel.name}`);
            }
        }
    });

    client.on("message", message => {

        if (message.member.user.bot) return;

        const server = discordServer.filter(value => value.code == message.guild.id)[0];

        const args = message.content.split(" ");

        if (process.env.NODE_ENV == "prod") {
            const checkDevOn = message.guild.members.filter(function(el) {
                return el.user.id == globalConfig.botDevId &&
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
                if (message.content.length < 3) {
                    message.channel.send("!롤 <닉네임> ㄱㄱ");
                    return;
                }

                const nickname = message.content.substring(3, message.content.length).trim();

                game.lol.searchLoLPlayData(message.channel, nickname);
                break;
            }
            case "!로테": {
                game.lol.getRotationsChampion(message.channel);
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
            case "!번역": {
                const commandLang = args[1];

                if (commandLang === undefined || args.length < 3 || message.content.indexOf("\"") == -1) {
                    message.channel.send("!번역 <번역코드> \"<문구>\" ㄱㄱ");
                    return;
                }

                const sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

                tool.translation.translationLang(message.channel, sendText, commandLang);
                break;
            }
            case "!번역코드": {
                tool.translation.getTranslationCode(message.channel);
                break;
            }
            case "!맞춤법" : {
                if (message.content.length < 7) {
                    message.channel.send("!맞춤법 <텍스트> ㄱㄱ");
                    return;
                }

                const content = message.content.substring(4, message.content.length).trim();

                tool.translation.checkSpellMessage(message.channel, content);
                break;
            }
            case "!이루": {
                const version = globalConfig.version;

                const printDataArr: {name: string; value: string;}[] = [];

                printDataArr.push({name: "만든이", value: "라이따이"});
                printDataArr.push({name: "VERSION", value: version});

                message.channel.send({
                    embed: {
                        color: 3447003,
                        fields: printDataArr
                    }
                });
                break;
            }
            case "!명령어": {
                const printDataArr: {name: string; value: string;}[] = [];

                printDataArr.push({name: "!롤 <닉네임>", value: "롤전적 검색"});
                printDataArr.push({name: "!메이플 <닉네임>", value: "메이플 정보 검색"});
                printDataArr.push({name: "!날씨", value: "서울시 날씨 데이터를 조회"});
                printDataArr.push({name: "!타이머추가 <분> <호출대상> \"<문구>\"", value: "호출대상을 지정하고 입력하면 입력한 시간에 따라 이용자 호출"});
                printDataArr.push({name: "!타이머취소 <타이머코드>", value: "타이머취소 방법"});
                printDataArr.push({name: "!엔화", value: "엔화 가격 조회"});
                printDataArr.push({name: "!코로나", value: "코로나 현황 조회"});
                printDataArr.push({name: "!나무랭킹", value: "나무위키 검색 랭킹 조회"});
                printDataArr.push({name: "!번역 <번역코드> \"<문구>\"", value: "파파고 API를 이용한 번역"});
                printDataArr.push({name: "!번역코드", value: "번역 가능한 코드 조회"});

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

    if (globalConfig.apiKey.discord != undefined) {
        client.login(globalConfig.apiKey.discord);
    } else {
        console.log("You Don't Have Api-Key go https://discordapp.com/developers/applications/");
    }
}).catch(error => {
    console.log(error);
});