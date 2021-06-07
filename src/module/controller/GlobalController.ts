import {HtmlParser} from "../HtmlParser";
import {GlobalConfig} from "../../config/GlobalConfig";
import {LeagueOfLegendController} from "./LeagueOfLegendController";
import {MapleStoryController} from "./MapleStoryController";
import {DMChannel, GroupDMChannel, TextChannel} from "discord.js";

export class GlobalController {
    private leagueOfLegendController: LeagueOfLegendController;
    private mapleStoryController: MapleStoryController;

    constructor(private htmlParser: HtmlParser, private globalConfig: GlobalConfig) {
        this.leagueOfLegendController = new LeagueOfLegendController(htmlParser, globalConfig);
        this.mapleStoryController = new MapleStoryController(htmlParser);
    }

    callCommand(channel: TextChannel | DMChannel | GroupDMChannel, command: string, message: string, args: string[]): void {
        this.leagueOfLegendController.callCommand(channel, command, message, args);
        this.mapleStoryController.callCommand(channel, command, message, args);
    }
}