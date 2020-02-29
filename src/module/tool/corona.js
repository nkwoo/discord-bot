const maplePersonSearchUrl = "http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=&brdGubun=&ncvContSeq=&contSeq=&board_id=&gubun=";

export function searchCoronaData (message, htmlparser, timeString) {
    message.channel.send("데이터 조회중......").then((editMsg)=> {
        htmlparser.getHtmlDocument(maplePersonSearchUrl).then(html => {

            if (!html) {
                editMsg.edit("데이터 조회 실패 ❌");
                message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                return;
            }

            const $ = htmlparser.changeHtmlToDom(html.data);
            let coronaArray = [];

            $(".bvc_txt > .tbl_scrl_mini2").first().find("tr").each(function () {
                let titleText = $(this).children("th").text();
                let dataText = $(this).children("td").text();
                coronaArray.push({name: titleText, value: dataText});
            });

            editMsg.edit("데이터 조회 성공 ✅");
            message.channel.send({
                embed: {
                    color: 3447003,
                    title: "현재 코로나 현황",
                    url: maplePersonSearchUrl,
                    description: `현재시간 - ${timeString}`,
                    fields: coronaArray
                }
            });

        });
    });
}