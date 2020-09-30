const namuRankingUrl = 'https://search.namu.wiki/api/ranking';

export function namuRankingDoc(message, htmlparser) {
    message.channel.send("데이터 조회중......").then((editMsg)=> {
        htmlparser.getHtmlDocument(namuRankingUrl).then(html => {

            if (!html) {
                editMsg.edit("데이터 조회 실패 ❌");
                message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                return;
            }
        
            const jsonData =  html.data;
            
            if (jsonData.length > 0) {
                
                
                var printDataArr = [];

                jsonData.forEach((data, idx) => {
                    printDataArr.push({name: (idx + 1) + "등", value: data});
                });

                editMsg.edit("데이터 조회 성공 ✅");
                message.channel.send({
                    embed: {
                        color: 3447003,
                        title: "나무위키 인기검색어",
                        fields: printDataArr
                    }
                });
            } else {
                editMsg.edit("데이터 조회 실패 ❌");
                message.channel.send("API 오류 발생");
            }
        });
    });
}