const coronaSearchUrl = "https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query=%EC%BD%94%EB%A1%9C%EB%82%9819";

export function searchCoronaData (message, htmlparser) {
    message.channel.send("데이터 조회중......").then((editMsg)=> {
        htmlparser.getHtmlDocument(coronaSearchUrl).then(html => {

            if (!html) {
                editMsg.edit("데이터 조회 실패 ❌");
                message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                return;
            }

            const $ = htmlparser.changeHtmlToDom(html.data);
            let coronaArray = [];

            $(".status_info ul li").each(function () {
                let titleText = $(this).children(".info_title").text();
                let dataText = $(this).children(".info_num").text();
                let changeTrendText = $(this).children(".info_variation").text();
                
                if (changeTrendText != "-")
                    changeTrendText = `(🔺${changeTrendText}명)`;
                else 
                    changeTrendText = "";

                coronaArray.push({name: titleText, value: `${dataText}명 ${changeTrendText}`});
            });

            editMsg.edit("데이터 조회 성공 ✅");
            message.channel.send({
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