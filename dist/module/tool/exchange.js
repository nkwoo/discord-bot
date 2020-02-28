"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.exchangeWonToJpy = exchangeWonToJpy;
var exchangeUrl = 'https://api.manana.kr/exchange/rate/KRW/JPY.json';

function exchangeWonToJpy(message, httppas) {
    httppas.fetch(exchangeUrl, function (err, $, res, body) {
        if (err) {
            message.channel.send("API 오류 발생");
            console.log(err);
            return;
        }

        var jsonData = JSON.parse(body);

        if (jsonData.length > 0) {
            var date = jsonData[0].date;
            var price = jsonData[0].rate.toFixed(2);

            var printDataArr = [];
            printDataArr.push({ name: "조회 시간", value: date });
            printDataArr.push({ name: "가격(1엔당)", value: price.toString() });

            message.channel.send({
                embed: {
                    color: 3447003,
                    title: "엔화 정보",
                    description: "현재 엔화 가격",
                    fields: printDataArr
                }
            });
        } else {
            message.channel.send("API 오류 발생");
        }
    });
}