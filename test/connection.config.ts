import {GlobalConfig} from "../src/config/GlobalConfig";
import * as fs from "fs";
import connection from "../src/database/Connection";

beforeAll(async () => {
    const globalConfig: GlobalConfig = JSON.parse(fs.readFileSync("./env/dev.json").toString());
    await connection.create(globalConfig);
});

afterAll(async () => {
    await connection.close();
});