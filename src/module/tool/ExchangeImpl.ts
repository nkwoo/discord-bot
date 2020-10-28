import {Exchange} from "./interface/Exchange";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../HtmlParser";

const exchangeUrl = 'https://api.manana.kr/exchange/rate/KRW/JPY.json';

export class ExchangeImpl implements Exchange {
    private htmlParser: HtmlParser;

    constructor() {
        this.htmlParser = new HtmlParser();
    }

    getExchangeWonToJpy(channel: TextChannel | DMChannel | GroupDMChannel) {
        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.getHtmlDocument(exchangeUrl).then(html => {

                if (!html) {
                    editMsg.edit("데이터 조회 실패 ❌");
                    channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                    return;
                }

                const jsonData = html.data;

                if (jsonData.length > 0) {
                    const date = jsonData[0].date;
                    const price = jsonData[0].rate.toFixed(2);

                    const printDataArr = [
                        {name: "조회 시간", value: date},
                        {name: "가격(1엔당)", value: price.toString()}
                    ];

                    editMsg.edit("데이터 조회 성공 ✅");
                    channel.send({
                        embed: {
                            color: 3447003,
                            title: "엔화 정보",
                            description: "현재 엔화 가격",
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