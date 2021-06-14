import {HtmlParser} from "../HtmlParser";
import {LeagueOfLegend} from "./interface/LeagueOfLegend";
import {LeagueOfLegendResource} from "./data/LeagueOfLegendResource";
import {getLeagueOfLegendGameType, LeagueOfLegendGameType} from "../../enum/LeagueOfLegendGameType";
import {GlobalConfig} from "../../config/GlobalConfig";
import {HttpMethod} from "../../enum/HttpMethod";
import {LeagueOfLegendUserDto} from "../../dto/LeagueOfLegendUserDto";
import {LeagueOfLegendRotationDto} from "../../dto/LeagueOfLegendRotationDto";
import GlobalException from "../../exception/GlobalException";
import {ErrorDto} from "../../dto/ErrorDto";

const LOL_ROTATION_CHAMPION_URL = "https://kr.api.riotgames.com/lol/platform/v3/champion-rotations";

export class LeagueOfLegendImpl implements LeagueOfLegend {

    private readonly lolResource: LeagueOfLegendResource;
    private readonly headerJson: {"X-Riot-Token": string | undefined;};

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.lolResource = new LeagueOfLegendResource(htmlParser);
        this.headerJson = {
            "X-Riot-Token": globalConfig.apiKey.lol
        };
    }

    async searchLoLPlayData(nickname: string): Promise<LeagueOfLegendUserDto | ErrorDto | undefined> {
        try {
            if (!this.lolResource.checkResource()) {
                GlobalException("리소스 정보를 불러올 수 없어 조회가 불가능합니다.");
                return;
            }

            const leagueOfLegendUserDto = new LeagueOfLegendUserDto();

            const resourceVersion = this.lolResource.resourceVersion;
            const profileIcon = this.lolResource.profileIcon;
            const champion = this.lolResource.champion;

            const summonerInfo = await this.htmlParser.requestHeaderData<ApiSummonerInfo>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURI(nickname)}`, this.headerJson);

            if (summonerInfo === undefined || summonerInfo.status !== 200) {
                GlobalException("유저 정보를 가져올 수 없습니다.");
                return;
            }

            let profileIconImageUrl = `https://ddragon.leagueoflegends.com/cdn/${resourceVersion.n.profileicon}/img/profileicon/`;

            profileIcon.dataArray.filter(value => value.id === summonerInfo.data.profileIconId).forEach(value => profileIconImageUrl += value.image.full);

            const rankInfo = await this.htmlParser.requestHeaderData<ApiLeagueInfo[]>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerInfo.data.id}`, this.headerJson);

            if (rankInfo === undefined || rankInfo.status != 200) {
                new Error("전적 정보를 찾을 수 없습니다.");
                return;
            }

            rankInfo.data.forEach(value => {
                if (value.queueType === "RANKED_SOLO_5x5") {
                    leagueOfLegendUserDto.soloRank = `${value.tier} ${value.rank}\n${value.leaguePoints}LP / ${value.wins}승 ${value.losses}패\n승률 ${((value.wins / (value.wins + value.losses)) * 100).toFixed(0)}%`;
                } else if (value.queueType === "RANKED_FLEX_SR") {
                    leagueOfLegendUserDto.freeRank = `${value.tier} ${value.rank}\n${value.leaguePoints}LP / ${value.wins}승 ${value.losses}패\n승률 ${((value.wins / (value.wins + value.losses)) * 100).toFixed(0)}%`;
                }
            });

            const matchInfo = await this.htmlParser.requestHeaderData<ApiMatchInfo>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/match/v4/matchlists/by-account/${summonerInfo.data.accountId}?endIndex=8`, this.headerJson);

            if (matchInfo === undefined || matchInfo.status != 200) {
                new Error("플레이한 챔피언 기록을 가져오다 오류가 발생하였습니다.");
                return;
            }

            matchInfo.data.matches.forEach(value => {
                champion.dataArray.filter(champion => champion.key === value.champion.toString()).forEach(champion => {
                    leagueOfLegendUserDto.lastPlayChampions.push(champion.name);
                });
            });

            const inGameInfo = await this.htmlParser.requestHeaderData<ApiSpectatorInfo>(HttpMethod.GET, `https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerInfo.data.id}`, this.headerJson);

            if (inGameInfo === undefined || !(inGameInfo.status === 200 || inGameInfo.status === 404)) {
                new Error("인게임 정보를 불러오다 오류가 발생하였습니다.");
                return;
            }

            if (inGameInfo.status === 200) {
                const spectatorInfo = inGameInfo.data;

                const gameStartDiff = new Date().getTime() - new Date(spectatorInfo.gameStartTime).getTime();

                const gameSecond = gameStartDiff / 1000;

                let inGameStatus = getLeagueOfLegendGameType(spectatorInfo.gameMode) === LeagueOfLegendGameType.CLASSIC && spectatorInfo.bannedChampions.length > 0 ? "솔랭" : getLeagueOfLegendGameType(spectatorInfo.gameMode);

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

                leagueOfLegendUserDto.inGameStatus = inGameStatus;
            }

            leagueOfLegendUserDto.state = true;
            leagueOfLegendUserDto.username = summonerInfo.data.name;
            leagueOfLegendUserDto.thumbnailIconUrl = profileIconImageUrl;
            leagueOfLegendUserDto.level = summonerInfo.data.summonerLevel;

            return leagueOfLegendUserDto;
        } catch (e) {
            return new ErrorDto(e.message);
        }
    }

    async getRotationsChampion(): Promise<LeagueOfLegendRotationDto | ErrorDto | undefined> {
        try {
            if (!this.lolResource.checkResource()) {
                GlobalException("리소스 정보를 불러올 수 없어 조회가 불가능합니다.");
                return;
            }

            const leagueOfLegendRotationDto = new LeagueOfLegendRotationDto();

            const rotationInfo = await this.htmlParser.requestHeaderData<ApiRotationsChampionInfo>(HttpMethod.GET, LOL_ROTATION_CHAMPION_URL, this.headerJson);

            if (rotationInfo == undefined) {
                GlobalException("로테이션 정보를 가져올 수 없습니다.");
                return;
            }

            const champion = this.lolResource.champion;

            champion.dataArray.filter(champion =>
                !!rotationInfo.data.freeChampionIds.find(freeChampion => +champion.key === freeChampion)
            ).forEach(value => {
                leagueOfLegendRotationDto.freeChampions.push(value.name);
            });

            champion.dataArray.filter(champion =>
                !!rotationInfo.data.freeChampionIdsForNewPlayers.find(freeNewChampion => +champion.key === freeNewChampion)
            ).forEach(value => {
                leagueOfLegendRotationDto.freeChampionsForBeginner.push(value.name);
            });

            leagueOfLegendRotationDto.state = true;
            return leagueOfLegendRotationDto;
        } catch (e) {
            return new ErrorDto(e.message);
        }
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