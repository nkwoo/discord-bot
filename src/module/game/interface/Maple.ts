import {ErrorDto} from "../../../dto/ErrorDto";
import {MapleCharacterDto} from "../../../dto/MapleCharacterDto";

export interface Maple {
    searchMaplePlayerData(nickname: string, serverType?: number): Promise<MapleCharacterDto | ErrorDto | undefined>;
}