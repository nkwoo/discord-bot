import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm/index";
import {VoiceLogType} from "../../../enum/VoiceLogType";

@Entity('voice_log')
export class VoiceLogEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    idx: number;

    @Column({name: "serverName"})
    server!: string;

    @Column({name: "channelName"})
    channel!: string;

    @Column({name: "userName"})
    user!: string;

    @Column({name: "logTime", type: "timestamp",  default: () => "CURRENT_TIMESTAMP"})
    time!: Date;

    @Column({name: "logType"})
    type!: VoiceLogType;

    @Column({name: "moveChannel", nullable: true})
    moveChannel?: string;

}