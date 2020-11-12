import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {LeagueOfLegend} from "./interface/LeagueOfLegend";

const lolUrl = "https://www.op.gg/summoner/";
const lolInGameUrl = "https://www.op.gg/summoner/ajax/spectateStatus/";
const lolUpdateUrl = "https://www.op.gg/summoner/ajax/renew.json/";

export class LeagueOfLegendImpl implements LeagueOfLegend {

    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    searchLoLPlayData(channel: TextChannel | DMChannel | GroupDMChannel, nickname: string): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.getHtmlDocumentParameter(lolUrl, {userName: nickname}).then(html => {

                if (!html) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                    return;
                }

                const $ = this.htmlParser.changeHtmlToDom(html.data);

                let checkCount = 0;

                $('.MostChampionContent.tabItem > div').each((index, element) => {
                    checkCount++;
                    const userId = $(element).attr("data-summoner-id");
                    this.htmlParser.getHtmlDocumentParameter(lolUpdateUrl, {summonerId: userId}).then(html => {

                        if (!html) {
                            editMsg.edit("데이터 조회 실패 ❌");
                            channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                            return;
                        }

                        let lolUserName: string,
                            lolUserTier: string,
                            lolUserTierPoint: string,
                            lolUserLevel: string,
                            lolInGame: string;
                        const lolPlayList: Array<string> = [];

                        this.htmlParser.getHtmlDocument(lolUrl + "userName=" + encodeURIComponent(nickname)).then(html => {

                            if (!html) {
                                editMsg.edit("데이터 조회 실패 ❌");
                                channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                                return;
                            }

                            const $ =  this.htmlParser.changeHtmlToDom(html.data);

                            $(".Profile > .Information > .Name").each((index, element) => {
                                lolUserName = $(element).text().trim();
                            });

                            $(".SummonerRatingMedium>.TierRankInfo>.TierRank").each((index, element) => {
                                lolUserTier = $(element).text().trim();
                            });

                            $(".SummonerRatingMedium>.TierRankInfo>.TierInfo>.LeaguePoints").each((index, element) => {
                                lolUserTierPoint = $(element).text().trim();
                            });

                            $(".SummonerLayout>.Header>.Face>.ProfileIcon>.Level").each((index, element) => {
                                lolUserLevel = $(element).text().trim();
                            });

                            $(".GameListContainer>.Content > .GameItemList .GameItemWrap .GameItem ").each((index, element) => {
                                lolPlayList.push($(element).children('.Content').children('.GameSettingInfo').children('.ChampionName').children().text());
                            });

                            if (lolUserName != undefined) {
                                if (lolUserTier == undefined) lolUserTier = "Unranked";
                                if (lolUserTierPoint == undefined) lolUserTierPoint = "-";

                                this.htmlParser.getHtmlDocumentParameter(lolInGameUrl + "summonerName=" + encodeURIComponent(nickname)).then(html => {

                                    if (!html) {
                                        channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                                        return;
                                    }

                                    const inGame = html.data;

                                    if (inGame.status) {
                                        lolInGame = "현재 게임중";
                                    } else {
                                        lolInGame = "Nope";
                                    }

                                    editMsg.edit("데이터 조회 성공 ✅");
                                    channel.send({
                                        embed: {
                                            color: 3447003,
                                            title: "롤전적",
                                            url: lolUrl + "userName=" + nickname,
                                            description: "당신의 전적을 검색해드립니다!",
                                            fields: [
                                                {name: "닉넴", value: lolUserName},
                                                {name: "레벨", value: lolUserLevel},
                                                {name: "인게임", value: lolInGame},
                                                {name: "티어", value: lolUserTier},
                                                {name: "랭포", value: lolUserTierPoint},
                                                {name: "최근 플레이한 챔프", value: lolPlayList.toString()}
                                            ]
                                        }
                                    });
                                });
                            } else {
                                editMsg.edit("데이터 조회 실패 ❌");
                                channel.send("전적 찾기를 실패했습니다.");
                                return;
                            }
                        });
                    });
                });

                if (checkCount === 0) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("전적 찾기를 실패했습니다.");
                }
            });
        });
    }
}