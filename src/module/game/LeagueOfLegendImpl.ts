import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {LeagueOfLegend} from "./interface/LeagueOfLegend";
import Cheerio = cheerio.Cheerio;

const lolUrl: string = "https://www.op.gg/summoner/";
const lolInGameUrl: string = "https://www.op.gg/summoner/ajax/spectateStatus/";
const lolUpdateUrl: string  = "https://www.op.gg/summoner/ajax/renew.json/";

export class LeagueOfLegendImpl implements LeagueOfLegend {

    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    searchLoLPlayData(channel: TextChannel | DMChannel | GroupDMChannel, nickname: string) {
        this.htmlParser.getHtmlDocumentParameter(lolUrl, {userName: nickname}).then(html => {

            if (!html) {
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
                        channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                        return;
                    }

                    let lolUserName: string,
                        lolUserTier: string,
                        lolUserTierPoint: string,
                        lolUserLevel: string,
                        lolInGame: string,
                        lolPlayList: Array<string> = [];

                    this.htmlParser.getHtmlDocument(lolUrl + "userName=" + encodeURIComponent(nickname)).then(html => {

                        if (!html) {
                            channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                            return;
                        }

                        const $ =  this.htmlParser.changeHtmlToDom(html.data);

                        $(".Profile > .Information > .Name").each(function (this: Cheerio) {
                            lolUserName = $(this).text().trim();
                        });

                        $(".SummonerRatingMedium>.TierRankInfo>.TierRank").each(function (this: Cheerio) {
                            lolUserTier = $(this).text().trim();
                        });

                        $(".SummonerRatingMedium>.TierRankInfo>.TierInfo>.LeaguePoints").each(function (this: Cheerio) {
                            lolUserTierPoint = $(this).text().trim();
                        });

                        $(".SummonerLayout>.Header>.Face>.ProfileIcon>.Level").each(function (this: Cheerio) {
                            lolUserLevel = $(this).text().trim();
                        });

                        $(".GameListContainer>.Content > .GameItemList .GameItemWrap .GameItem ").each(function (this: Cheerio, index: number) {
                            lolPlayList.push($(this).children('.Content').children('.GameSettingInfo').children('.ChampionName').children().text());
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

                                let printDataArr = [];

                                printDataArr.push({name: "닉넴", value: lolUserName});
                                printDataArr.push({name: "레벨", value: lolUserLevel});
                                printDataArr.push({name: "인게임", value: lolInGame});
                                printDataArr.push({name: "티어", value: lolUserTier});
                                printDataArr.push({name: "랭포", value: lolUserTierPoint});
                                printDataArr.push({name: "최근 플레이한 챔프", value: lolPlayList.toString()});

                                channel.send({
                                    embed: {
                                        color: 3447003,
                                        title: "롤전적",
                                        url: lolUrl + "userName=" + nickname,
                                        description: "당신의 전적을 검색해드립니다!",
                                        fields: printDataArr
                                    }
                                });
                            });
                        } else {
                            channel.send("전적 찾기를 실패했습니다.");
                            return;
                        }
                    });
                });
            });

            if (checkCount === 0) {
                channel.send("전적 찾기를 실패했습니다.");
            }
        });
    }
}