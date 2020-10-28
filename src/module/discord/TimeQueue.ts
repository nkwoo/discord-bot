export class TimeQueue {
    timer: ReturnType<typeof setTimeout>;
    endTime: number;
    owner: string;
    rank: number;

    constructor(timer: ReturnType<typeof setTimeout>, endTime: number, owner: string, rank: number) {
        this.timer = timer;
        this.endTime = endTime;
        this.owner = owner;
        this.rank = rank;
    }
}