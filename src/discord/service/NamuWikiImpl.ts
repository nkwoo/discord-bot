import {NamuWiki} from "./interface/NamuWiki";
import {DMChannel, NewsChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../../global/HtmlParser";
import {HttpMethod} from "../enum/HttpMethod";

const NAMU_RANKING_URL = 'https://search.namu.wiki/api/ranking';

export class NamuWikiImpl implements NamuWiki {

    constructor(private htmlParser: HtmlParser) {
    }

    getNamuRanking(channel: TextChannel | DMChannel | NewsChannel): void {
        channel.send("데이터 조회중......").then((editMsg)=> {
            this.htmlParser.requestNoHeaderParameterData<string[]>(HttpMethod.GET, NAMU_RANKING_URL).then((json) => {

                if (!json) {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다."));
                    return;
                }

                const rankingArray: Array<string> = json.data;

                if (rankingArray.length > 0) {

                    const printDataArr: {name: string, value: string}[] = [];

                    rankingArray.forEach((value, index) => printDataArr.push({name: (index + 1) + "등", value: value}));

                    editMsg.edit("데이터 조회 성공 ✅").then(() => {
                        channel.send({
                            embed: {
                                color: 3447003,
                                title: "나무위키 인기검색어",
                                fields: printDataArr
                            }
                        });
                    });
                } else {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("API 오류가 발생하였습니다."));
                }
            });
        });
    }
}