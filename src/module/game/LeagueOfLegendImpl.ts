import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {LeagueOfLegend} from "./interface/LeagueOfLegend";
import {LeagueOfLegendResource} from "./data/LeagueOfLegendResource";

const lolUrl = "https://www.op.gg/summoner/";
const lolInGameUrl = "https://www.op.gg/summoner/ajax/spectateStatus/";
const lolUpdateUrl = "https://www.op.gg/summoner/ajax/renew.json/";

const lolRotationsChampionUrl = "https://kr.api.riotgames.com/lol/platform/v3/champion-rotations";

export class LeagueOfLegendImpl implements LeagueOfLegend {

    private htmlParser: HtmlParser;
    private lolResource: LeagueOfLegendResource;

    constructor() {
        this.htmlParser = new HtmlParser();
        this.lolResource = new LeagueOfLegendResource(this.htmlParser);
    }

    // getChampion() {
    //     https://ddragon.leagueoflegends.com/cdn/10.6.1/data/ko_KR/champion.json
    // }

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

    getRotationsChampion(channel: TextChannel | DMChannel | GroupDMChannel) {
        channel.send("데이터 조회중......").then((editMsg) => {

            const headerJson = {
                "X-Riot-Token": process.env.LOL_API_KEY
            };

            this.htmlParser.getGetJson<ApiRotationsChampionInfo>(lolRotationsChampionUrl, headerJson).then(json => {
                if (json === undefined) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("로테이션 정보를 가져올 수 없습니다..");
                    return;
                }

                const champion = this.lolResource.champion;

                if (champion === undefined) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("챔피언 정보를 가져올 수 없습니다..");
                    return;
                }

                const championArray = Object.values(champion.data);

                const freeChampionArray: string[] = [];
                const freeNewChampionArray: string[] = [];

                championArray.filter(champion =>
                    !!json.data.freeChampionIds.find(freeChampion => +champion.key === freeChampion)
                ).forEach(value => {
                    freeChampionArray.push(value.name);
                });

                championArray.filter(champion =>
                    !!json.data.freeChampionIdsForNewPlayers.find(freeNewChampion => +champion.key === freeNewChampion)
                ).forEach(value => {
                    freeNewChampionArray.push(value.name);
                });

                editMsg.edit("데이터 조회 성공 ✅");
                channel.send({
                    embed: {
                        color: 3447003,
                        title: "이번주 롤 로테이션",
                        fields: [
                            {name: "로테이션", value: freeChampionArray.join(", ")},
                            {name: "로테이션 - 뉴비용", value: freeNewChampionArray.join(", ")}
                        ]
                    }
                });
                //channel.send({files: ['https://ddragon.leagueoflegends.com/cdn/10.6.1/img/champion/Shyvana.png', 'https://ddragon.leagueoflegends.com/cdn/10.6.1/img/champion/Aatrox.png','https://ddragon.leagueoflegends.com/cdn/10.6.1/img/champion/Shyvana.png', 'https://ddragon.leagueoflegends.com/cdn/10.6.1/img/champion/Aatrox.png']});
            });
        });
    }
}

interface ApiRotationsChampionInfo {
    freeChampionIds: number[],
    freeChampionIdsForNewPlayers: number[],
    maxNewPlayerLevel: number
}