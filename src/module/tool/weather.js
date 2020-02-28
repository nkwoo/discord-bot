const wearther3DayInUrl = 'http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=1100000000';
const wearther3DayOutUrl = 'http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnId=109';

export function parseSeoulWeather (message, xmlConvert, httppas) {
	message.channel.send("데이터 조회중......").then((editMsg)=> {
        let printDataArr = [];
        httppas.fetch(wearther3DayInUrl, "UTF-8", function (err, $, req, res) {

            let resultJson = JSON.parse(xmlConvert.xml2json(res, {compact: true, spaces: 4}));
            let dataArr = resultJson.rss.channel.item.description.body.data;
            let checkNextDay = "";
            let nowDate = new Date();

            for (let j = 0; j < dataArr.length; j++) {
                if (dataArr[j].day._text != checkNextDay) {
                    let printStr = nowDate.getFullYear() + "-" + ((nowDate.getMonth() + 1) > 9 ? (nowDate.getMonth() + 1) : "0" + (nowDate.getMonth() + 1)) + "-" + (nowDate.getDate() > 9 ? nowDate.getDate() : "0" + nowDate.getDate());
                    let printData = "날씨 : " + dataArr[j].wfKor._text + "\n최저온도 : " + Number(dataArr[j].tmn._text) + "도\n최고온도 : " + Number(dataArr[j].tmx._text);
                    nowDate.setDate(nowDate.getDate() + 1);
                    printDataArr.push({ name: printStr, value: printData});
                    checkNextDay = dataArr[j].day._text;
                }
            }

            httppas.fetch(wearther3DayOutUrl, "UTF-8", function (err, $, req, res) {

                let result2 = JSON.parse(xmlConvert.xml2json(res, {compact: true, spaces: 4}));
                let dataArr = result2.rss.channel.item.description.body.location;

                for(let j = 1; j < 11; j = j + 2) {
                    let printStr = dataArr[0].data[j].tmEf._text.substring(0,10);
                    let printData = "날씨 : " + dataArr[0].data[j].wf._text + "\n최저온도 : " + dataArr[0].data[j].tmn._text + "도\n최고온도 : " + dataArr[0].data[j].tmx._text;
                    printDataArr.push({ name: printStr, value: printData});
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