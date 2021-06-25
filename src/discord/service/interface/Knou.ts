import {KnouNoticeDto} from "../../../database/dto/KnouNoticeDto";
import {DMChannel, NewsChannel, TextChannel} from "discord.js";
import {KnouNoticeEntity} from "../../../database/entity/domain/KnouNoticeEntity";

export interface Knou {
    getNoticeData(): Promise<KnouNoticeDto[]>;
    sendNotice(channel: TextChannel | DMChannel | NewsChannel, notice: KnouNoticeEntity): Promise<void>;
}