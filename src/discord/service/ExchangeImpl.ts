import {Exchange} from "./interface/Exchange";
import {DMChannel, NewsChannel, TextChannel} from "discord.js";
import {HtmlParser} from "../../global/HtmlParser";
import {HttpMethod} from "../enum/HttpMethod";

const exchangeUrl = 'https://api.manana.kr/exchange/rate/KRW/JPY.json';

export class ExchangeImpl implements Exchange {

    constructor(private htmlParser: HtmlParser) {
    }

    getExchangeWonToJpy(channel: TextChannel | DMChannel | NewsChannel): void {
        channel.send("데이터 조회중......").then((editMsg) => {
            this.htmlParser.requestNoHeaderParameterData<ExchangeData[]>(HttpMethod.GET, exchangeUrl).then(html => {

                if (!html) {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다."));
                    return;
                }

                const jsonData = html.data;

                if (jsonData.length > 0) {
                    const date = jsonData[0].date;
                    const price = (Number(jsonData[0].rate) * 100).toFixed(1);

                    editMsg.edit("데이터 조회 성공 ✅").then(() => {
                        channel.send({
                            embed: {
                                color: 3447003,
                                title: "엔화 정보",
                                description: "현재 엔화 가격",
                                fields: [
                                    {name: "조회 시간", value: date},
                                    {name: "가격(100엔당)", value: price.toString()}
                                ]
                            }
                        });
                    });
                } else {
                    editMsg.edit("데이터 조회 실패 ❌").then(() => channel.send("API 오류 발생"));
                }
            });
        });
    }
}

interface ExchangeData {
    date: string,
    name: string,
    rate: number,
    timestamp: string
}