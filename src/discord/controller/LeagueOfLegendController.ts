import {LeagueOfLegend} from "../service/interface/LeagueOfLegend";
import {LeagueOfLegendImpl} from "../service/LeagueOfLegendImpl";
import {HtmlParser} from "../../global/HtmlParser";
import {GlobalConfig} from "../../config/GlobalConfig";
import Discord, {DMChannel, MessageEmbed, NewsChannel, TextChannel} from "discord.js";
import {LeagueOfLegendRotationDto} from "../dto/LeagueOfLegendRotationDto";
import {LeagueOfLegendUserDto} from "../dto/LeagueOfLegendUserDto";
import {CallCommand} from "../enum/CallCommand";

export class LeagueOfLegendController {
    private readonly lol: LeagueOfLegend;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.lol = new LeagueOfLegendImpl(this.htmlParser, this.globalConfig);
    }

    callCommand(message: Discord.Message, command: CallCommand, args: string[]): void {
        switch (command) {
            case CallCommand.LeagueOfLegendScore: {
                if (args.length < 2 || message.content.indexOf("\"") === -1 || message.content.lastIndexOf("\"") === -1) {
                    message.channel.send(`닉네임이 포함되어 있지 않습니다.`);
                    return;
                }

                const nickname = message.content.substring(message.content.indexOf("\"") + 1, message.content.lastIndexOf("\""));

                this.getUserData(message.channel, nickname);
                break;
            }
            case CallCommand.LeagueOfLegendRotation: {
                this.getRotationChampions(message.channel);
                break;
            }
        }
    }

    private getUserData(channel: TextChannel | DMChannel | NewsChannel, nickname: string): void {
        channel.send("데이터 조회중......").then(async (editMsg) => {
            const leagueOfLegendUserDto = await this.lol.searchLoLPlayData(nickname);

            if (leagueOfLegendUserDto && leagueOfLegendUserDto.state && leagueOfLegendUserDto instanceof LeagueOfLegendUserDto) {
                editMsg.edit("데이터 조회 성공 ✅").then(() => {
                    channel.send(new MessageEmbed()
                        .setColor("#3399CC")
                        .setTitle(leagueOfLegendUserDto.username)
                        .setURL(`https://www.op.gg/summoner/userName=${encodeURI(leagueOfLegendUserDto.username)}`)
                        .setDescription(`레벨 : ${leagueOfLegendUserDto.level}`)
                        .setThumbnail(leagueOfLegendUserDto.thumbnailIconUrl)
                        .addField("개인/듀오 랭크", leagueOfLegendUserDto.soloRank, true)
                        .addField("자유 랭크", leagueOfLegendUserDto.freeRank, true)
                        .addField("인게임", leagueOfLegendUserDto.inGameStatus)
                        .addField("최근 플레이 한 챔피언", leagueOfLegendUserDto.lastPlayChampions.length !== 0 ? leagueOfLegendUserDto.lastPlayChampions.join("\n") : "최근 플레이 없음")
                    );
                });
            } else {
                editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send(leagueOfLegendUserDto ? leagueOfLegendUserDto.message : "유저 정보를 가져올 수 없습니다."));
            }
        });
    }

    private getRotationChampions(channel: TextChannel | DMChannel | NewsChannel): void {
        channel.send("데이터 조회중......").then(async (editMsg) => {
            const lolRotationDto = await this.lol.getRotationsChampion();

            if (lolRotationDto && lolRotationDto.state && lolRotationDto instanceof LeagueOfLegendRotationDto) {
                editMsg.edit("데이터 조회 성공 ✅").then(() => {
                    channel.send({
                        embed: {
                            color: 3447003,
                            title: "이번주 롤 로테이션",
                            fields: [
                                {name: "로테이션", value: lolRotationDto.freeChampions.join(", ")},
                                {name: "로테이션 - 입문자 추가", value: lolRotationDto.freeChampionsForBeginner.join(", ")}
                            ]
                        }
                    });
                });
            } else {
                editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send(lolRotationDto ? lolRotationDto.message : "로테이션 정보를 가져올 수 없습니다.."));
            }
        });
    }
}