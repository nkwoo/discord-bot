import {DMChannel, GroupDMChannel, RichEmbed, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";
import {LeagueOfLegend} from "./interface/LeagueOfLegend";
import {LeagueOfLegendResource} from "./data/LeagueOfLegendResource";
import {getLeagueOfLegendGameType, LeagueOfLegendGameType} from "../../enum/LeagueOfLegendGameType";
import {GlobalConfig} from "../../global/GlobalConfig";
import {HttpMethod} from "../../enum/HttpMethod";

const lolRotationsChampionUrl = "https://kr.api.riotgames.com/lol/platform/v3/champion-rotations";

export class LeagueOfLegendImpl implements LeagueOfLegend {

    private lolResource: LeagueOfLegendResource;
    private headerJson: {"X-Riot-Token": string | undefined;};

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.lolResource = new LeagueOfLegendResource(this.htmlParser);

        this.headerJson = {
            "X-Riot-Token": globalConfig.apiKey.lol
        };
    }

    searchLoLPlayData(channel: TextChannel | DMChannel | GroupDMChannel, nickname: string): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.requestHeaderData<ApiSummonerInfo>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(nickname)}`, this.headerJson).then((json) => {
                if (json === undefined || json.status != 200) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("유저정보를 가져올 수 없습니다..");
                    return;
                }

                const resourceVersion = this.lolResource.resourceVersion;
                const profileIcon = this.lolResource.profileIcon;
                const champion = this.lolResource.champion;

                if (profileIcon === undefined || resourceVersion === undefined || champion === undefined) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("필수 정보를 불러올 수 없습니다..");
                    return;
                }

                const profileIconArray = Object.values(profileIcon.data);
                const championArray = Object.values(champion.data);

                let profileIconImageUrl = `http://ddragon.leagueoflegends.com/cdn/${resourceVersion.n.profileicon}/img/profileicon/`;

                profileIconArray.filter(value => value.id === json.data.profileIconId).forEach(value => profileIconImageUrl += value.image.full);

                const summonerInfo = json.data;

                this.htmlParser.requestHeaderData<ApiLeagueInfo[]>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerInfo.id}`, this.headerJson).then((json) => {
                    if (json === undefined || json.status != 200) {
                        editMsg.edit("데이터 조회 실패 ❌");
                        channel.send("유저정보를 가져올 수 없습니다..");
                        return;
                    }

                    let soloInfo = "Unranked";
                    let freeInfo = "Unranked";

                    const leagueTierInfo = json.data;

                    if (leagueTierInfo === undefined) {
                        editMsg.edit("데이터 조회 실패 ❌");
                        channel.send("유저정보를 가져올 수 없습니다..");
                        return;
                    }

                    leagueTierInfo.forEach(value => {
                        if (value.queueType === "RANKED_SOLO_5x5") {
                            soloInfo = `${value.tier} ${value.rank}\n${value.leaguePoints}LP / ${value.wins}승 ${value.losses}패\n승률 ${((value.wins / (value.wins + value.losses)) * 100).toFixed(0)}%`;
                        } else if (value.queueType === "RANKED_FLEX_SR") {
                            freeInfo = `${value.tier} ${value.rank}\n${value.leaguePoints}LP / ${value.wins}승 ${value.losses}패\n승률 ${((value.wins / (value.wins + value.losses)) * 100).toFixed(0)}%`;
                        }
                    });

                    this.htmlParser.requestHeaderData<ApiMatchInfo>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerInfo.accountId}?endIndex=8`, this.headerJson).then((json) => {
                        if (json === undefined || json.status != 200) {
                            editMsg.edit("데이터 조회 실패 ❌");
                            channel.send("유저정보를 가져올 수 없습니다..");
                            return;
                        }

                        const matchInfo = json.data.matches;

                        const championNameArray: string[] = [];

                        matchInfo.forEach(value => {
                            championArray.filter(champion => champion.key === value.champion.toString()).forEach(champion => {
                                championNameArray.push(champion.name);
                            });
                        });

                        if (championNameArray.length === 0) championNameArray.push("최근 플레이 없음");

                        this.htmlParser.requestHeaderData<ApiSpectatorInfo>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerInfo.id}`, this.headerJson).then((json) => {
                            if (json === undefined || !(json.status === 200 || json.status === 404)) {
                                editMsg.edit("데이터 조회 실패 ❌");
                                channel.send("유저정보를 가져올 수 없습니다..");
                                return;
                            }

                            let inGameStatus = "현재 게임중이 아닙니다.";

                            if (json.status === 200) {
                                const spectatorInfo = json.data;

                                inGameStatus = getLeagueOfLegendGameType(spectatorInfo.gameMode) === LeagueOfLegendGameType.CLASSIC && spectatorInfo.bannedChampions.length > 0 ? "솔랭" : getLeagueOfLegendGameType(spectatorInfo.gameMode);

                                const gameStartDiff = new Date().getTime() - new Date(spectatorInfo.gameStartTime).getTime();

                                const gameSecond = gameStartDiff / 1000;

                                if (gameSecond > 60) {
                                    const gameMinutes = gameSecond / 60;
                                    if (gameMinutes > 60) {
                                        inGameStatus += ` - ${(gameMinutes / 60).toFixed(0)}시간 ${(gameMinutes % 60).toFixed(0)}분 ${(gameSecond % 60).toFixed(0)}초`;
                                    } else {
                                        inGameStatus += ` - ${(gameMinutes % 60).toFixed(0)}분 ${(gameSecond % 60).toFixed(0)}초`;
                                    }
                                } else {
                                    inGameStatus += ` - ${(gameSecond / 60).toFixed(0)}초`;
                                }
                            }

                            editMsg.edit("데이터 조회 성공 ✅");
                            channel.send(new RichEmbed()
                                .setColor("#3399CC")
                                .setTitle(summonerInfo.name)
                                .setURL(`http://www.op.gg/summoner/userName=${encodeURI(nickname)}`)
                                .setDescription(`레벨 : ${summonerInfo.summonerLevel}`)
                                .setThumbnail(profileIconImageUrl)
                                .addField("개인/듀오 랭크", soloInfo, true)
                                .addField("자유 랭크", freeInfo, true)
                                .addField("인게임", inGameStatus)
                                .addField("최근 플레이 한 챔피언", championNameArray.join("\n"))
                            );
                            //TODO 추가적으로 상세한 KDA 출력
                        });
                    });
                });
            });
        });
    }

    getRotationsChampion(channel: TextChannel | DMChannel | GroupDMChannel): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.requestHeaderData<ApiRotationsChampionInfo>(HttpMethod.GET, lolRotationsChampionUrl, this.headerJson).then((json) => {
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

interface ApiSummonerInfo {
    id: string,
    accountId: string,
    puuid: string,
    name: string,
    profileIconId: number,
    revisionDate: number,
    summonerLevel: number
}

interface ApiLeagueInfo {
    leagueId: string,
    queueType: string,
    tier: string,
    rank: string,
    summonerId: string,
    summonerName: string,
    leaguePoints: number,
    wins: number,
    losses: number,
    veteran: boolean,
    inactive: boolean,
    freshBlood: boolean,
    hotStreak: boolean,
    miniSeries: {
        target: number,
        wins: number,
        losses: number,
        progress: string
    }
}

interface ApiMatchInfo {
    matches: {
        platformId: string,
        gameId: number,
        champion: number,
        queue: number,
        season: number,
        timestamp: number,
        role: string,
        lane: string
    }[],
    startIndex: number,
    endIndex: number,
    totalGames: number
}

interface ApiSpectatorInfo {
    gameId: number,
    mapId: number,
    gameMode: string,
    gameType: string,
    gameQueueConfigId: number,
    participants: {
        teamId: number,
        spell1Id: number,
        spell2Id: number,
        championId: number,
        profileIconId: number,
        summonerName: string,
        bot: boolean,
        summonerId: string,
        gameCustomizationObjects: [],
        perks: {
            perkIds: number[],
            perkStyle: number,
            perkSubStyle: number
        }
    }[],
    observers: {
        encryptionKey: string
    },
    platformId: string,
    bannedChampions: {
        championId: number,
        teamId: number,
        pickTurn: number
    }[],
    gameStartTime: number,
    gameLength: number
}