import {KnouNoticeDto} from "../dto/KnouNoticeDto";
import {KnouNoticeEntity} from "./domain/KnouNoticeEntity";

export class KnouNoticeDomain extends KnouNoticeDto {

    constructor(entity: KnouNoticeEntity) {
        super(entity.boardIdx, entity.title, entity.writeDate, entity.postLink);
    }
}