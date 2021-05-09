import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

@Entity('KNOU_NOTICE')
export class KnouNoticeEntity extends BaseEntity {

    @PrimaryColumn({name: "BOARD_IDX"})
    boardIdx: number;

    @Column({name: "TITLE"})
    title: string;

    @Column({name: "WRITE_DT"})
    writeDate: string;

    @Column({name: "POST_LINK"})
    postLink: string;

    @Column({name: "IS_NOTIFY", default: false})
    isNotify!: boolean;
}