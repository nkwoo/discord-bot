import * as cron from "node-cron";
import {ScheduledTask} from "node-cron";
import {KnouNoticeService} from "../database/service/KnouNoticeService";
import {Tool} from "./Tool";
import {Connection} from "typeorm";
import {TextChannel} from "discord.js";

export class Schedule {
    private crawlingCron: ScheduledTask;
    private discordNotifyCron: ScheduledTask;

    private knouNoticeService: KnouNoticeService;

    constructor(private connection: Connection, private tool: Tool) {
        this.knouNoticeService = new KnouNoticeService(connection);
    }

    init(knouTextChannelList: TextChannel[]): void {
        this.crawlingCron = cron.schedule("* * 0,6,12,18 * * *", () => {
            this.tool.knou.getNoticeData().then(noticeDtoArray =>  this.knouNoticeService.upsertNotice(noticeDtoArray));
        }, {
            scheduled: false
        });

        this.discordNotifyCron = cron.schedule("* * 1,7,13,19 * * *", () => {
            this.knouNoticeService.getUnNotifyNotices().then(noticeList =>
                noticeList.forEach(notice =>
                    knouTextChannelList.forEach(channel =>
                        this.tool.knou.sendNotice(channel, notice)
                            .then(() => this.knouNoticeService.updateNotifyNotice(notice)))));
        }, {
            scheduled: false
        });
        console.log("Schedule Init Success");
    }

    start(): void {
        this.crawlingCron.start();
        this.discordNotifyCron.start();
        console.log("Schedule Start");
    }

    stop(): void {
        this.crawlingCron.stop();
        this.discordNotifyCron.stop();
    }
}