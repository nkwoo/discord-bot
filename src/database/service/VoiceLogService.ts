import {VoiceLogType} from "../../discord/enum/VoiceLogType";
import {Connection} from "typeorm";
import {VoiceLogEntity} from "../entity/domain/VoiceLogEntity";

export class VoiceLogService {

    constructor(private connection: Connection) {
    }

    async record(serverName: string, channelName: string, userName: string, logType: VoiceLogType, moveChannelName?: string): Promise<void> {
        await this.connection.createQueryBuilder()
            .insert()
            .into(VoiceLogEntity)
            .values({
                server: serverName,
                channel: channelName,
                user: userName,
                type: logType,
                moveChannel: logType === VoiceLogType.MOVE ? moveChannelName : undefined
            })
            .execute()
            .catch(reason => {
                console.log(reason);
                return false;
            });
    }
}