import {HtmlParser} from "../../HtmlParser";
import {HttpMethod} from "../../../enum/HttpMethod";

const resourceApiVersionCheckApi = "https://ddragon.leagueoflegends.com/realms/kr.json";

export class LeagueOfLegendResource {
    private _resourceVersion: ResourceVersionVo | undefined;
    private _champion: ChampionVo | undefined;
    private _profileIcon: ProfileIconVo | undefined;

    constructor(private htmlParser: HtmlParser) {
        this.resourceRefresh();
    }

    resourceRefresh(): void {
        //리소스 서버 버전 가져오기
        this.htmlParser.requestNoHeaderParameterData<ResourceVersionVo>(HttpMethod.GET, resourceApiVersionCheckApi).then((json) => {
            if (json != undefined) {
                this.resourceVersion = json.data;

                this.htmlParser.requestNoHeaderParameterData<ChampionVo>(HttpMethod.GET, `https://ddragon.leagueoflegends.com/cdn/${this.resourceVersion.n.champion}/data/ko_KR/champion.json`).then((json) => {
                    if (json != undefined) {
                        this.champion = json.data;
                    }
                });

                this.htmlParser.requestNoHeaderParameterData<ProfileIconVo>(HttpMethod.GET, `https://ddragon.leagueoflegends.com/cdn/${this.resourceVersion.n.profileicon}/data/ko_KR/profileicon.json`).then((json) => {
                    if (json != undefined) {
                        this.profileIcon = json.data;
                    }
                });
                //https://shyunku.tistory.com/56
            }
        });
    }

    get resourceVersion(): ResourceVersionVo | undefined {
        return this._resourceVersion;
    }

    set resourceVersion(value: ResourceVersionVo | undefined) {
        this._resourceVersion = value;
    }

    get champion(): ChampionVo | undefined {
        return this._champion;
    }

    set champion(value: ChampionVo | undefined) {
        this._champion = value;
    }

    get profileIcon(): ProfileIconVo | undefined {
        return this._profileIcon;
    }

    set profileIcon(value: ProfileIconVo | undefined) {
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
    format: string,
    type: string,
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
    type: string,
    version: string
}