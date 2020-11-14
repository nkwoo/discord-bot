import {NamuWiki} from "./interface/NamuWiki";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";

const namuRankingUrl = 'https://search.namu.wiki/api/ranking';

export class NamuWikiImpl implements NamuWiki {

    constructor(private htmlParser: HtmlParser) {
    }

    getNamuRanking(channel: TextChannel | DMChannel | GroupDMChannel): void {
        channel.send("데이터 조회중......").then((editMsg)=> {
            this.htmlParser.getHtmlDocument(namuRankingUrl).then(html => {

                if (!html) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                    return;
                }

                const rankingArray: Array<string> = html.data;

                if (rankingArray.length > 0) {

                    const printDataArr: {name: string, value: string}[] = [];

                    rankingArray.forEach((value, index) => {
                        printDataArr.push({name: (index + 1) + "등", value: value});
                    });

                    editMsg.edit("데이터 조회 성공 ✅");
                    channel.send({
                        embed: {
                            color: 3447003,
                            title: "나무위키 인기검색어",
                            fields: printDataArr
                        }
                    });
                } else {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("API 오류 발생");
                }
            });
        });
    }
}