const lolUrl = "https://www.op.gg/summoner/";
const lolInGameUrl = "https://www.op.gg/summoner/ajax/spectateStatus/";
const lolUpdateUrl = "https://www.op.gg/summoner/ajax/renew.json/";

export function searchLOLPlayerData (message, nickname, htmlparser) {
    htmlparser.getHtmlDocumentParameter(lolUrl, {userName: nickname}).then(html => {

        if (!html) {
            message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
            return;
        }

        const $ = htmlparser.changeHtmlToDom(html.data);
        
        let checkCount = 0;

        $('.MostChampionContent.tabItem > div').each(function () {
            checkCount++;
            var userId = $(this).attr("data-summoner-id");
            htmlparser.getHtmlDocumentParameter(lolUpdateUrl, {summonerId: userId}).then(html => {

                if (!html) {
                    message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                    return;
                }

                var lolUserName = null,
                    lolUserTier = null,
                    lolUserTierPoint = null,
                    lolUserLevel = null,
                    lolInGame = null,
                    lolPlayList = [];
                
                htmlparser.getHtmlDocument(lolUrl + "userName=" + encodeURIComponent(nickname)).then(html => {

                    if (!html) {
                        message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                        return;
                    }

                    const $ = htmlparser.changeHtmlToDom(html.data);

                    $(".Profile > .Information > .Name").each(function () {
                        lolUserName = $(this).text().trim();
                    });

                    $(".SummonerRatingMedium>.TierRankInfo>.TierRank").each(function () {
                        lolUserTier = $(this).html().trim();
                    });

                    $(".SummonerRatingMedium>.TierRankInfo>.TierInfo>.LeaguePoints").each(function () {
                        lolUserTierPoint = $(this).html().trim();
                    });

                    $(".SummonerLayout>.Header>.Face>.ProfileIcon>.Level").each(function () {
                        lolUserLevel = $(this).html().trim();
                    });

                    $(".GameListContainer>.Content > .GameItemList .GameItemWrap .GameItem ").each(function (index) {
                        lolPlayList[index] = $(this).children('.Content').children('.GameSettingInfo').children('.ChampionName').children().text();
                    });

                    if (lolUserName != null) {
                        if (lolUserTier == null) lolUserTier = "Unranked";
                        if (lolUserTierPoint == null) lolUserTierPoint = "-";

                        htmlparser.getHtmlDocumentParameter(lolInGameUrl + "summonerName=" + encodeURIComponent(nickname)).then(html => {

                            if (!html) {
                                message.channel.send("조회 서버 오류로 인해 데이터를 가져올 수 없습니다.");
                                return;
                            }

                            var inGame = html.data;

                            if (inGame.status) {
                                lolInGame = "현재 게임중";
                            } else {
                                lolInGame = "Nope";
                            }

                            var printDataArr = [];

                            printDataArr.push({name: "닉넴", value: lolUserName});
                            printDataArr.push({name: "레벨", value: lolUserLevel});
                            printDataArr.push({name: "인게임", value: lolInGame});
                            printDataArr.push({name: "티어", value: lolUserTier});
                            printDataArr.push({name: "랭포", value: lolUserTierPoint});
                            printDataArr.push({name: "최근 플레이한 챔프", value: lolPlayList.toString()});

                            message.channel.send({
                                embed: {
                                    color: 3447003,
                                    title: "롤전적",
                                    url: lolUrl + "userName=" + nickname,
                                    description: "당신의 전적을 검색해드립니다!",
                                    fields: printDataArr
                                }
                            });
                        });
                    } else {
                        message.channel.send("전적 찾기를 실패했습니다.");
                        return;
                    }
                });
            });
        });

        if (checkCount === 0) {
            message.channel.send("전적 찾기를 실패했습니다.");
        }
    });
}