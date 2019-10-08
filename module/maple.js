let maplePersonSearchUrl = 'https://maplestory.nexon.com/Ranking/World/Total';
function maplePlayerData (message, nickname, type, httppas, Discord) {
    /*
    * 20190626
    * 메이플 데이터 가져올때 사용
    * message : 디스코드 메세지 변수
    * nickname : 닉네임
    * type : 랭킹월드 구분 / 0 = 리부트 제외한 전체월드 / 254 = 리부트 월드들
    */
    var worldRank = null, chartacterName = null, chartacterJob = null, chartacterLevel = null;
    httppas.fetch(maplePersonSearchUrl + "?c=" + nickname + "&w=" + type, "UTF-8", function (err, $, req, res) {
        if(err){
            console.log(err);
            return;
        }
        $('.search_com_chk > td:nth-child(1) > p:nth-child(1)').each(function (post) {                  //랭킹
            worldRank = $(this).text().trim();
        });
        $('.search_com_chk > td:nth-child(2) > dl > dt').each(function (post) {                         //닉네임
            chartacterName = $(this).text().trim();
        });
        $('.search_com_chk > td:nth-child(2) > dl > dd').each(function (post) {                         //직업
            chartacterJob = $(this).text().trim();
        });
        $('.search_com_chk > td:nth-child(3)').each(function (post) {                                   //레벨
            chartacterLevel = $(this).text().trim();
        });

        $('.search_com_chk > td:nth-child(2) > span > img:nth-child(1)').each(function (post) {         //캐릭터사진
            const embedMessage = new Discord.RichEmbed()
                .setTitle("메이플 닉네임 검색")
                .setColor("#3399CC")
                .setDescription("당신의 쪼렙 메이플 닉네임 검색 해드립니다.")
                .setURL(maplePersonSearchUrl + "?c=" + nickname)
                .addField("닉네임", chartacterName, true)
                .addField("직업", chartacterJob, true)
                .addField("월드 랭킹", worldRank, true)
                .addField("레벨", chartacterLevel, true);

            message.channel.send({files: [$(this)[0].attribs.src]}).then(message.channel.send(embedMessage));
        });
        if(worldRank == null || chartacterName == null || chartacterJob == null) {
            if(type == 0) {
                maplePlayerData(message, nickname, 254);
            } else {
                message.channel.send("검색 안되는거 보니 메이플 안하시나봄;");
            }
        }
    });
}
module.exports.maplePlayerData = maplePlayerData;