export enum YoutubeCommand {
    PLAY= "재생",
    SOUND = "소리",
    PAUSE = "일시정지",
    SKIP = "스킵",
    PLAYLIST = "목록",
    EXIT = "종료",
    NONE = ""
}

export function getYoutubeCommand(callCommand: string): YoutubeCommand {
    switch (callCommand) {
        case "재생":
            return YoutubeCommand.PLAY;
        case "소리":
            return YoutubeCommand.SOUND;
        case "일시정지":
            return YoutubeCommand.PAUSE;
        case "스킵":
            return YoutubeCommand.SKIP;
        case "목록":
            return YoutubeCommand.PLAYLIST;
        case "종료":
            return YoutubeCommand.EXIT;
        default:
            return YoutubeCommand.NONE;
    }
}