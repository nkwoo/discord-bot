import {CommonDto} from "./CommonDto";

export class ErrorDto extends CommonDto {
    constructor(message: string) {
        super(false);
        this.message = message;
    }
}