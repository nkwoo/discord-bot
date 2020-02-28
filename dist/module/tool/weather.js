'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseSeoulWeather = parseSeoulWeather;
var wearther3DayInUrl = 'http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=1100000000';
var wearther3DayOutUrl = 'http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnId=109';

function parseSeoulWeather(message, xmlConvert, httppas) {
    message.channel.send("데이터 조회중......").then(function (editMsg) {
        var printDataArr = [];
        httppas.fetch(wearther3DayInUrl, "UTF-8", function (err, $, req, res) {

            var resultJson = JSON.parse(xmlConvert.xml2json(res, { compact: true, spaces: 4 }));
            var dataArr = resultJson.rss.channel.item.description.body.data;
            var checkNextDay = "";
            var nowDate = new Date();

            for (var j = 0; j < dataArr.length; j++) {
                if (dataArr[j].day._text != checkNextDay) {
                    var printStr = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1 > 9 ? nowDate.getMonth() + 1 : "0" + (nowDate.getMonth() + 1)) + "-" + (nowDate.getDate() > 9 ? nowDate.getDate() : "0" + nowDate.getDate());
                    var printData = "날씨 : " + dataArr[j].wfKor._text + "\n최저온도 : " + Number(dataArr[j].tmn._text) + "도\n최고온도 : " + Number(dataArr[j].tmx._text);
                    nowDate.setDate(nowDate.getDate() + 1);
                    printDataArr.push({ name: printStr, value: printData });
                    checkNextDay = dataArr[j].day._text;
                }
            }

            httppas.fetch(wearther3DayOutUrl, "UTF-8", function (err, $, req, res) {

                var result2 = JSON.parse(xmlConvert.xml2json(res, { compact: true, spaces: 4 }));
                var dataArr = result2.rss.channel.item.description.body.location;

                for (var _j = 1; _j < 11; _j = _j + 2) {
                    var _printStr = dataArr[0].data[_j].tmEf._text.substring(0, 10);
                    var _printData = "날씨 : " + dataArr[0].data[_j].wf._text + "\n최저온도 : " + dataArr[0].data[_j].tmn._text + "도\n최고온도 : " + dataArr[0].data[_j].tmx._text;
                    printDataArr.push({ name: _printStr, value: _printData });
                }

                editMsg.edit("데이터 조회 성공 ✅");
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: "날씨",
                        description: "서울시 날씨 데이터입니다!",
                        fields: printDataArr
                    }
                });
            });
        });
    });
}