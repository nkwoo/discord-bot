import * as Discord from "discord.js";
import {TextChannel} from "discord.js";
import * as fs from "fs";

import {logger} from './module/Winston';

import {Tool} from "./module/Tool";
import {TimeQueue} from "./module/discord/TimeQueue";
import {HtmlParser} from "./module/HtmlParser";
import {GlobalConfig} from "./config/GlobalConfig";
import {VoiceLogType} from "./enum/VoiceLogType";
import {VoiceLogService} from "./database/service/VoiceLogService";
import {Schedule} from "./module/Schedule";
import connection from "./database/Connection";
import {GlobalController} from "./module/controller/GlobalController";

const timerQueue: TimeQueue[] = [];

let configPath = "./env/dev.json";

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "dev";
}

switch (process.env.NODE_ENV) {
    case "prod":
        configPath = "./env/prod.json";
        break;
    case "dev":
        configPath = "./env/dev.json";
        break;
}

const globalConfig: GlobalConfig = JSON.parse(fs.readFileSync(configPath).toString());

const htmlParser = new HtmlParser();

const globalController = new GlobalController(htmlParser, globalConfig);

const tool = new Tool(htmlParser, globalConfig);

logger.info(`Server Env - ${process.env.NODE_ENV}`);
logger.info("loading......");

connection.create(globalConfig).then(async connection => {

    const voiceLogService = new VoiceLogService(connection);

    const schedule = new Schedule(connection, tool);

    const client = new Discord.Client();

    client.once("ready", () => {
        logger.info("Server Ready!");

        const knouTextChannelList: TextChannel[] = [];

        globalController.updateServer(client);

        client.guilds.cache.forEach((guild) => {
            guild.channels.cache.filter(channel => channel.name === "knou").forEach(channel => {
                if (channel instanceof TextChannel) {
                    knouTextChannelList.push(channel);
                }
            });
        });

        schedule.init(knouTextChannelList);

        schedule.start();
    });

    client.on("error", () => {
        console.error();
    });

    client.on("guildCreate", () => {
        globalController.updateServer(client);
    });

    client.on("guildDelete", () => {
        globalController.updateServer(client);
    });

    client.on("guildUpdate", () => {
        globalController.updateServer(client);
    });

    client.on("guildMemberAdd", () => {
        globalController.updateServer(client);
    });

    client.on("guildMemberRemove", () => {
        globalController.updateServer(client);
    });


    client.on("voiceStateUpdate", (oldMember, newMember) => {
        const oldUserChannel = oldMember.channel;
        const newUserChannel = newMember.channel;

        if (oldUserChannel == null) {
            if (newUserChannel != null && newMember.member != null) {
                voiceLogService.record(newUserChannel.guild.name, newUserChannel.name, newMember.member.nickname != null ? newMember.member.nickname : newMember.member.displayName, VoiceLogType.IN);
            }
        } else if (newUserChannel === null) {
            if (oldMember.member != null) {
                voiceLogService.record(oldUserChannel.guild.name, oldUserChannel.name, oldMember.member.nickname != null ? oldMember.member.nickname : oldMember.member.displayName, VoiceLogType.OUT);
            }
        } else {
            if (!(oldUserChannel.guild.name === newUserChannel.guild.name && oldUserChannel.name === newUserChannel.name)) {
                if (oldMember.member != null) {
                    voiceLogService.record(oldUserChannel.guild.name, oldUserChannel.name, oldMember.member.nickname != null ? oldMember.member.nickname : oldMember.member.displayName, VoiceLogType.MOVE, `${newUserChannel.guild.name} / ${newUserChannel.name}`);
                }
            }
        }
    });

    client.on("message", message => {

        if (message.member == null || message.guild == null) return;

        if (message.member.user.bot) return;

        if (!message.content.startsWith(globalConfig.discord.prefix)) return;

        const args = message.content.split(" ");

        const command = args[0].substr(1);

        globalController.callCommand(message, command, args);

        switch (command) {
            case "날씨": {
                tool.weather.getSeoulWeather(message.channel);
                break;
            }
            case "타이머추가": {
                const commandHour = Number(args[1]);

                if (message.content.length < 5 || isNaN(commandHour) || args.length < 4 || message.content.indexOf("\"") == -1) {
                    message.channel.send(`${globalConfig.discord.prefix}타이머추가 <분> <호출대상> "<문구>" 형식대로 입력해주세요.`);
                    return;
                }

                if (commandHour > 1440 || 1 > commandHour) {
                    message.channel.send("최소 1 ~ 1440분 까지 사용할 수 있습니다.");
                    return;
                }

                tool.timer.addTimer(message, timerQueue, args[2], commandHour);
                break;
            }
            case "타이머취소": {
                if (message.content.length < 5 || args.length < 2) {
                    message.channel.send(`${globalConfig.discord.prefix}타이머취소 <타이머 번호> 형식대로 입력해주세요.`);
                    return;
                }

                tool.timer.removeTimer(message, timerQueue, Number(args[1]));
                break;
            }
            case "타이머": {
                if (globalConfig.discord.administratorId.filter(value => message.member ? value === message.member.id : false).length === 0) {
                    message.channel.send("권한이 없습니다.");
                    return;
                }

                tool.timer.timerList(message, timerQueue);
                break;
            }
            case "상태": {
                tool.system.getSystemState(message.channel);
                break;
            }
            case "엔화": {
                tool.exchange.getExchangeWonToJpy(message.channel);
                break;
            }
            case "코로나": {
                tool.corona.getCoronaState(message.channel);
                break;
            }
            case "나무랭킹": {
                tool.namuWiki.getNamuRanking(message.channel);
                break;
            }
            case "번역": {
                const commandLang = args[1];

                if (commandLang === undefined || args.length < 3 || message.content.indexOf("\"") == -1) {
                    message.channel.send(`${globalConfig.discord.prefix}번역 <번역코드> "<문구>" 형식대로 입력해주세요.`);
                    return;
                }

                const sendText = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

                tool.translation.translationLang(message.channel, sendText, commandLang);
                break;
            }
            case "번역코드": {
                tool.translation.getTranslationCode(message.channel);
                break;
            }
            case "맞춤법" : {
                if (message.content.length < 7) {
                    message.channel.send("텍스트가 포함되어 있지 않습니다.");
                    return;
                }

                const content = message.content.substring(4, message.content.length).trim();

                tool.translation.checkSpellMessage(message.channel, content);
                break;
            }
        }
    });

    if (globalConfig.apiKey.discord != undefined) {
        await client.login(globalConfig.apiKey.discord);
    } else {
        logger.error("You Don't Have Api-Key go https://discordapp.com/developers/applications/");
    }
}).catch(error => {
    console.log(error);
});