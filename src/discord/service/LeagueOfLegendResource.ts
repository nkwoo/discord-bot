import {HtmlParser} from "../../global/HtmlParser";
import {HttpMethod} from "../enum/HttpMethod";

const resourceApiVersionCheckApi = "https://ddragon.leagueoflegends.com/realms/kr.json";

export class LeagueOfLegendResource {
    private _resourceVersion: ResourceVersionVo;
    private _champion: ChampionVo;
    private _profileIcon: ProfileIconVo;

    constructor(private htmlParser: HtmlParser) {
        this.resourceUpdate().then();
    }

    checkResource(): boolean {
        return this.resourceVersion != undefined && this.champion != undefined && this.profileIcon != undefined;
    }

    async resourceUpdate(): Promise<void> {
        const resourceVersionInfo = await this.htmlParser.requestNoHeaderParameterData<ResourceVersionVo>(HttpMethod.GET, resourceApiVersionCheckApi);

        if (resourceVersionInfo != undefined) {
            this.resourceVersion = resourceVersionInfo.data;

            const championInfo = await this.htmlParser.requestNoHeaderParameterData<ChampionVo>(HttpMethod.GET, `https://ddragon.leagueoflegends.com/cdn/${resourceVersionInfo.data.n.champion}/data/ko_KR/champion.json`);
            const iconInfo = await this.htmlParser.requestNoHeaderParameterData<ProfileIconVo>(HttpMethod.GET, `https://ddragon.leagueoflegends.com/cdn/${resourceVersionInfo.data.n.profileicon}/data/ko_KR/profileicon.json`);

            if (championInfo != undefined) {
                this.champion = championInfo.data;
                this.champion.dataArray = Object.values(championInfo.data.data);
            }
            if (iconInfo != undefined) {
                this.profileIcon = iconInfo.data;
                this.profileIcon.dataArray = Object.values(iconInfo.data.data);
            }
        }
    }

    get resourceVersion(): ResourceVersionVo {
        return this._resourceVersion;
    }

    set resourceVersion(value: ResourceVersionVo) {
        this._resourceVersion = value;
    }

    get champion(): ChampionVo {
        return this._champion;
    }

    set champion(value: ChampionVo) {
        this._champion = value;
    }

    get profileIcon(): ProfileIconVo {
        return this._profileIcon;
    }

    set profileIcon(value: ProfileIconVo) {
        this._profileIcon = value;
    }
}

// 리소스 버전
export interface ResourceVersionVo {
    cdn: string,
    css: string,
    dd: string,
    l: string,
    lg: string,
    n: {
        champion: string,
        item: string,
        language: string,
        map: string,
        mastery: string,
        profileicon: string,
        rune: string,
        sticker: string,
        summoner: string
    },
    profileiconmax: number,
    store: string | undefined,
    v: string
}

// 챔피언 정보
export interface ChampionVo {
    data: {
        [key: string]: {
            blurb: string,
            id: string,
            image: {
                full: string,
                sprite: string,
                group: string
            },
            key: string,
            name: string,
            partype: string,
            tags: string[],
            title: string,
            version: string
        }
    },
    dataArray: ChampionData[],
    format: string,
    type: string,
    version: string
}

interface ChampionData {
    blurb: string,
    id: string,
    image: {
        full: string,
        sprite: string,
        group: string
    },
    key: string,
    name: string,
    partype: string,
    tags: string[],
    title: string,
    version: string
}

// 프로필 아이콘 정보
export interface ProfileIconVo {
    data: {
        [key: string]: {
            id: number,
            image: {
                full: string
            }
        }
    },
    dataArray: ProfileIconData[],
    type: string,
    version: string
}

interface ProfileIconData {
    id: number,
    image: {
        full: string
    }
}