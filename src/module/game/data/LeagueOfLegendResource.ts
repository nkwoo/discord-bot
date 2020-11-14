import {HtmlParser} from "../../HtmlParser";

const resourceApiVersionCheckApi = "https://ddragon.leagueoflegends.com/realms/kr.json";

export class LeagueOfLegendResource {
    private _resourceVersion: ResourceVersionVo | undefined;
    private _champion: ChampionVo | undefined;

    constructor(private htmlParser: HtmlParser) {
        this.resourceRefresh();
    }

    resourceRefresh(): void {
        //리소스 서버 버전 가져오기
        this.htmlParser.getGetJson<ResourceVersionVo>(resourceApiVersionCheckApi).then(json => {
            if (json != undefined) {
                this.resourceVersion = json.data;

                this.htmlParser.getGetJson<ChampionVo>(`https://ddragon.leagueoflegends.com/cdn/${this._resourceVersion?.n.champion}/data/ko_KR/champion.json`).then(json => {
                    if (json != undefined) {
                        this.champion = json.data;
                    }
                });
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
}

interface ChampionVo {
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

interface ResourceVersionVo {
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