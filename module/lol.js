let lolUrl = 'https://www.op.gg/summoner/';
let lolInGameUrl = 'https://www.op.gg/summoner/ajax/spectateStatus/';
let lolUpdateUrl = 'https://www.op.gg/summoner/ajax/renew.json/';

//차후 공식 API를 사용하도록 수정 TODO
function lolPlayerData (message, nickname, httppas) {
    var param = {userName: nickname};
    httppas.fetch(lolUrl, param, function (err, $, res) {
        if (err) {
            console.log(err);
            return;
        }
        $('.MostChampionContent.tabItem>div').each(function (post) {
            var userId = $(this).attr("data-summoner-id");
            httppas.fetch(lolUpdateUrl, {summonerId: userId}, function (err, $, res) {

                var lolUserName = null,
                    lolUserTier = null,
                    lolUserTierPoint = null,
                    lolUserLevel = null,
                    lolInGame = null,
                    lolPlayList = [];

                httppas.fetch(lolUrl + "userName=" + encodeURIComponent(nickname), "UTF-8", function (err, $, req, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    $(".SummonerLayout>.Header>.Profile>.Information>.Name").each(function (post) {
                        lolUserName = $(this).html().trim();
                    });
                    $(".SummonerRatingMedium>.TierRankInfo>.TierRank").each(function (post) {
                        lolUserTier = $(this).html().trim();
                    });
                    $(".SummonerRatingMedium>.TierRankInfo>.Series").each(function (post) {
                        //console.log($(this).html().trim());
                    });
                    $(".SummonerRatingMedium>.TierRankInfo>.TierInfo>.LeaguePoints").each(function (post) {
                        lolUserTierPoint = $(this).html().trim();
                    });
                    $(".SummonerLayout>.Header>.Face>.ProfileIcon>.Level").each(function (post) {
                        lolUserLevel = $(this).html().trim();
                    });
                    $(".GameListContainer>.Content > .GameItemList .GameItemWrap .GameItem ").each(function (index) {
                        lolPlayList[index] = $(this).children('.Content').children('.GameSettingInfo').children('.ChampionName').children().text();
                    });

                    if (lolUserName != null) {
                        if (lolUserTier == null) lolUserTier = "Unranked";
                        if (lolUserTierPoint == null) lolUserTierPoint = "-";

                        httppas.fetch(lolInGameUrl, param, function (err, $, res, body) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            var inGame = JSON.parse(body);
                            console.log(body);
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
                                    description: "버러지같은 당신의 전적을 검색해드립니다!",
                                    fields: printDataArr
                                }
                            });
                        });
                    } else {
                        message.channel.send("전적도 안뜨는 버러지누!");
                        return;
                    }
                });
            });
        });
    });
}
module.exports.lolPlayerData = lolPlayerData;
