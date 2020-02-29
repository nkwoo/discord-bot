const exchangeUrl = 'https://api.manana.kr/exchange/rate/KRW/JPY.json';

export function exchangeWonToJpy (message, htmlparser) {
    htmlparser.getHtmlDocument(exchangeUrl).then(html => {

        if (!html) {
            message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
            return;
        }
       
        const jsonData =  html.data;
        
        if (jsonData.length > 0) {
            const date = jsonData[0].date;
            const price = jsonData[0].rate.toFixed(2);
            
            var printDataArr = [];
            printDataArr.push({name: "조회 시간", value: date});
            printDataArr.push({name: "가격(1엔당)", value: price.toString()});

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