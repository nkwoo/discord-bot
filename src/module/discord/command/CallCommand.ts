export enum CallCommand {
    LeagueOfLegendScore = "롤",
    LeagueOfLegendRotation = "로테",
    MapleScore = "메이플",
    YoutubePlayerPlay = "재생",
    YoutubePlayerSound = "소리",
    YoutubePlayerPause = "일시정지",
    YoutubePlayerSkip = "스킵",
    YoutubePlayList = "목록",
    YoutubePlayerExit = "종료",
    TimerAdd = "타이머추가",
    TimerList = "타이머",
    TimerRemove = "타이머취소",
    Bot = "봇",
    Command = "명령어",
    NONE = ""
}

export function getCommand(callCommand: string): CallCommand {
    switch (callCommand) {
        case "롤":
            return CallCommand.LeagueOfLegendScore;
        case "로테":
            return CallCommand.LeagueOfLegendRotation;
        case "메이플":
            return CallCommand.MapleScore;
        case "재생":
            return CallCommand.YoutubePlayerPlay;
        case "소리":
            return CallCommand.YoutubePlayerSound;
        case "일시정지":
            return CallCommand.YoutubePlayerPause;
        case "스킵":
            return CallCommand.YoutubePlayerSkip;
        case "목록":
            return CallCommand.YoutubePlayList;
        case "종료":
            return CallCommand.YoutubePlayerExit;
        case "타이머추가":
            return CallCommand.TimerAdd;
        case "타이머":
            return CallCommand.TimerList;
        case "타이머취소":
            return CallCommand.TimerRemove;
        case "봇":
            return CallCommand.Bot;
        case "명령어":
            return CallCommand.Command;
        default:
            return CallCommand.NONE;
    }
}

export function getYoutubeCommand(callCommand: string): CallCommand {
    switch (callCommand) {
        case "재생":
            return CallCommand.YoutubePlayerPlay;
        case "소리":
            return CallCommand.YoutubePlayerSound;
        case "일시정지":
            return CallCommand.YoutubePlayerPause;
        case "스킵":
            return CallCommand.YoutubePlayerSkip;
        case "목록":
            return CallCommand.YoutubePlayList;
        case "종료":
            return CallCommand.YoutubePlayerExit;
        default:
            return CallCommand.NONE;
    }
}