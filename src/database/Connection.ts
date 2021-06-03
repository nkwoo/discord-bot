import {Connection, createConnection, getConnection} from 'typeorm';
import {GlobalConfig} from "../config/GlobalConfig";

const connection = {
    async create(globalConfig: GlobalConfig): Promise<Connection> {
        const databaseHost: string = process.env.NODE_ENV == "prod" && process.env.DOCKER_COMPOSE_CHECK == "true" ? globalConfig.docker.host : globalConfig.connection.host;
        const databasePort: number = process.env.NODE_ENV == "prod" && process.env.DOCKER_COMPOSE_CHECK == "true" ? globalConfig.docker.port : globalConfig.connection.port;

        return await createConnection({
            type: "mariadb",
            host: databaseHost,
            port: databasePort,
            username: globalConfig.connection.username,
            password: globalConfig.connection.password,
            database: globalConfig.connection.database,
            synchronize: true,
            logging: globalConfig.connection.logging,
            entities: [
                "src/database/entity/**/*.ts"
            ]
        });
    },

    async close(): Promise<void> {
        await getConnection().close();
    },
};
export default connection;