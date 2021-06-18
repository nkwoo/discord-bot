import {HtmlParser} from "../HtmlParser";
import {GlobalConfig} from "../../config/GlobalConfig";
import {LeagueOfLegendController} from "./LeagueOfLegendController";
import {MapleStoryController} from "./MapleStoryController";
import Discord from "discord.js";
import {DiscordServer} from "../discord/DiscordServer";
import {YoutubeController} from "./YoutubeController";
import {Member} from "../discord/Member";

export class GlobalController {
    private serverList: DiscordServer[] = [];

    private leagueOfLegendController: LeagueOfLegendController;
    private mapleStoryController: MapleStoryController;
    private youtubeController: YoutubeController;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.leagueOfLegendController = new LeagueOfLegendController(this.htmlParser, this.globalConfig);
        this.mapleStoryController = new MapleStoryController(this.htmlParser);
        this.youtubeController = new YoutubeController(this.globalConfig, this);
    }

    getServerList(): DiscordServer[] {
        return this.serverList;
    }

    callCommand(message: Discord.Message, command: string, args: string[]): void {
        this.leagueOfLegendController.callCommand(message, command, args);
        this.mapleStoryController.callCommand(message, command, args);
        if (this.youtubeController) {
            this.youtubeController.callCommand(message, command, args);
        }

        switch (command) {
            case "봇": {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        fields: [
                            {name: "만든이", value: "NKWOO"},
                            {name: "VERSION", value: "2.0.1"}
                        ]
                    }
                });
                break;
            }
            case "명령어": {
                message.channel.send({
                    embed: {
                        color: 3447003,
                        fields: [
                            {name: `${this.globalConfig.discord.prefix}롤 "<닉네임>"`, value: "롤 전적 검색"},
                            {name: `${this.globalConfig.discord.prefix}메이플 "<닉네임>"`, value: "메이플 정보 검색"},
                            {name: `${this.globalConfig.discord.prefix}날씨`, value: "서울시 날씨 데이터를 조회"},
                            {name: `${this.globalConfig.discord.prefix}타이머추가 <분> <호출대상> "<문구>"`, value: "호출대상을 지정하고 입력하면 입력한 시간에 따라 이용자 호출"},
                            {name: `${this.globalConfig.discord.prefix}타이머취소 <타이머코드>`, value: "타이머취소 방법"},
                            {name: `${this.globalConfig.discord.prefix}엔화`, value: "엔화 가격 조회"},
                            {name: `${this.globalConfig.discord.prefix}코로나`, value: "코로나 현황 조회"},
                            {name: `${this.globalConfig.discord.prefix}나무랭킹`, value: "나무위키 검색 랭킹 조회"},
                            {name: `${this.globalConfig.discord.prefix}번역 <번역코드> "<문구>"`, value: "파파고 API를 이용한 번역"},
                            {name: `${this.globalConfig.discord.prefix}번역코드`, value: "번역 가능한 코드 조회"}
                        ]
                    }
                });
                break;
            }
        }
    }

    updateServer(client: Discord.Client): void {
        const updateServerList: DiscordServer[] = [];

        client.guilds.cache.forEach((guild, id) => {
            const discordServer = new DiscordServer(id, guild.name);

            guild.members.cache.forEach((member, id) => {
                discordServer.memberList.push(new Member(id, member));
            });

            updateServerList.push(discordServer);
        });

        updateServerList.forEach(server => {
            const matchServerList = this.serverList.filter(beforeServer => beforeServer.id === server.id);

            if (matchServerList.length === 1) {
                this.serverList[0].name = server.name;
                this.serverList[0].memberList = server.memberList;
            } else {
                this.serverList.push(new DiscordServer(server.id, server.name));
            }
        });
    }
}