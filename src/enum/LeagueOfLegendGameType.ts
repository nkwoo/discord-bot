export enum LeagueOfLegendGameType {
    CLASSIC = "일반",
    ODIN = "-",
    ARAM = "무작위 총력전",
    TUTORIAL = "튜토리얼",
    URF = "우르프",
    DOOMBOTSTEEMO = "-",
    ONEFORALL = "-",
    ASCENSION = "-",
    FIRSTBLOOD = "-",
    KINGPORO = "-",
    SIEGE = "-",
    ASSASSINATE = "-",
    ARSR = "-",
    DARKSTAR = "-",
    STARGUARDIAN = "-",
    PROJECT = "-",
    GAMEMODEX = "-",
    ODYSSEY = "-",
    KNOWN = "알수없음"
}

export function getLeagueOfLegendGameType(lang: string): LeagueOfLegendGameType {
    switch (lang) {
        case "CLASSIC":
            return LeagueOfLegendGameType.CLASSIC;
        case "ODIN":
            return LeagueOfLegendGameType.ODIN;
        case "ARAM":
            return LeagueOfLegendGameType.ARAM;
        case "TUTORIAL":
            return LeagueOfLegendGameType.TUTORIAL;
        case "DOOMBOTSTEEMO":
            return LeagueOfLegendGameType.DOOMBOTSTEEMO;
        case "ONEFORALL":
            return LeagueOfLegendGameType.ONEFORALL;
        case "ASCENSION":
            return LeagueOfLegendGameType.ASCENSION;
        case "FIRSTBLOOD":
            return LeagueOfLegendGameType.FIRSTBLOOD;
        case "KINGPORO":
            return LeagueOfLegendGameType.KINGPORO;
        case "SIEGE":
            return LeagueOfLegendGameType.SIEGE;
        case "ASSASSINATE":
            return LeagueOfLegendGameType.ASSASSINATE;
        case "ARSR":
            return LeagueOfLegendGameType.ARSR;
        case "DARKSTAR":
            return LeagueOfLegendGameType.DARKSTAR;
        case "STARGUARDIAN":
            return LeagueOfLegendGameType.STARGUARDIAN;
        case "PROJECT":
            return LeagueOfLegendGameType.PROJECT;
        case "GAMEMODEX":
            return LeagueOfLegendGameType.GAMEMODEX;
        case "ODYSSEY":
            return LeagueOfLegendGameType.ODYSSEY;
        default:
            return LeagueOfLegendGameType.KNOWN;
    }
}