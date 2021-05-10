import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {VoiceLogType} from "../../../enum/VoiceLogType";

@Entity('VOICE_LOG')
export class VoiceLogEntity extends BaseEntity {

    @PrimaryGeneratedColumn({name: "IDX"})
    idx: number;

    @Column({name: "SERVER_NAME"})
    server!: string;

    @Column({name: "CHANNEL_NAME"})
    channel!: string;

    @Column({name: "USER_NAME"})
    user!: string;

    @Column({name: "LOG_DT", type: "timestamp",  default: () => "CURRENT_TIMESTAMP"})
    time!: Date;

    @Column({name: "LOG_TYPE"})
    type!: VoiceLogType;

    @Column({name: "MOVE_CHANNEL", nullable: true})
    moveChannel?: string;

}