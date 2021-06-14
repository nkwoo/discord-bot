import {HtmlParser} from "../HtmlParser";
import {GlobalConfig} from "../../config/GlobalConfig";
import {LeagueOfLegendController} from "./LeagueOfLegendController";
import {MapleStoryController} from "./MapleStoryController";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export class GlobalController {
    private leagueOfLegendController: LeagueOfLegendController;
    private mapleStoryController: MapleStoryController;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.leagueOfLegendController = new LeagueOfLegendController(this.htmlParser, this.globalConfig);
        this.mapleStoryController = new MapleStoryController(htmlParser);
    }

    callCommand(channel: TextChannel | DMChannel | GroupDMChannel, command: string, message: string, args: string[]): void {
        this.leagueOfLegendController.callCommand(channel, command, message, args);
        this.mapleStoryController.callCommand(channel, command, message, args);

        switch (command) {
            case "봇": {
                channel.send({
                    embed: {
                        color: 3447003,
                        fields: [
                            {name: "만든이", value: "NKWOO"},
                            {name: "VERSION", value: "1.12.2"}
                        ]
                    }
                });
                break;
            }
            case "명령어": {
                channel.send({
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
}