import {Corona} from "./interface/Corona";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";

const coronaSearchUrl = "https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query=%EC%BD%94%EB%A1%9C%EB%82%9819";

export class CoronaImpl implements Corona {

    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    getCoronaState(channel: TextChannel | DMChannel | GroupDMChannel): void {
        channel.send("데이터 조회중......").then((editMsg)=> {
            this.htmlParser.getHtmlDocument(coronaSearchUrl).then(html => {

                if (!html) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                    return;
                }

                const $ = this.htmlParser.changeHtmlToDom(html.data);
                const coronaArray: {name: string; value: string;}[] = [];

                $(".status_info ul li").each((index, element) => {
                    const titleText = $(element).children(".info_title").text();
                    const dataText = $(element).children(".info_num").text();
                    const changeTrendText = $(element).children(".info_variation").text() !== "=" ? `(🔺${$(element).children(".info_variation").text()}명)` : "";

                    coronaArray.push({name: titleText, value: `${dataText}명 ${changeTrendText}`});
                });

                editMsg.edit("데이터 조회 성공 ✅");
                channel.send({
                    embed: {
                        color: 3447003,
                        title: "현재 코로나 현황",
                        description: $(".status_bottom > div > a").text(),
                        fields: coronaArray
                    }
                });

            });
        });
    }
}