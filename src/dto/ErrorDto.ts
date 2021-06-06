import {CommonDto} from "./CommonDto";

export class ErrorDto extends CommonDto {
    constructor(message: string) {
        super();
        this.state = false;
        this.message = message;
    }
}