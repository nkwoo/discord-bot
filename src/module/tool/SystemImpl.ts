import {System} from "./interface/System";
import {DMChannel, NewsChannel, TextChannel} from "discord.js";
import * as system from "systeminformation";
import {Systeminformation} from "systeminformation";
import command from "child_process";

export class SystemImpl implements System {
    async getSystemState(channel: TextChannel | DMChannel | NewsChannel): Promise<void> {
        const printDataArr: {name: string; value: string; inline?: boolean;}[] = [];

        const sendMessage = await channel.send("데이터 조회중......");

        const serverOsInfo = await system.osInfo();
        const serverCpuInfo = await system.cpu();

        //TODO 타 OS 온도 지원
        const serverMemory = await system.mem();
        const serverDiskInfo = await system.fsSize();

        const usedMemory = (serverMemory.used / 1024 / 1024 / 1024).toFixed(1);
        const totalMemory = (serverMemory.total / 1024 / 1024 / 1024).toFixed(1);

        printDataArr.push({name: "OS 정보", value: serverOsInfo.distro});
        printDataArr.push({name: "CPU 정보", value: `${serverCpuInfo.manufacturer} ${serverCpuInfo.brand}`});

        const cpuTemp: Systeminformation.CpuTemperatureData = await system.cpuTemperature();
        const graphicsData: Systeminformation.GraphicsData = await system.graphics();

        if (serverOsInfo.logofile == "raspbian") {
            const linuxTemper: ResultVo = await this.linuxGetCpuGpuTemperature();

            if (linuxTemper.state == "success") {
                printDataArr.push({name: "CPU 온도", value: linuxTemper.data.cpu});
                printDataArr.push({name: "GPU 온도", value: linuxTemper.data.gpu});
            } else {
                printDataArr.push({name: "CPU 온도", value: "미지원"});
                printDataArr.push({name: "GPU 온도", value: "미지원"});
            }
        } else {
            if (cpuTemp != null) {
                printDataArr.push({name: "CPU 온도", value: `${cpuTemp.main}°C`});
            }
            graphicsData.controllers.forEach(value => {
                printDataArr.push({name: "GPU 정보", value: `${value.model} / ${value.vram}`});
            });
        }


        printDataArr.push({name: "Memory 사용량", value: `${usedMemory}GB / ${totalMemory}GB`});

        let diskInfoString = "";

        serverDiskInfo.forEach(disk => {
            const usedDisk = (disk.used / 1024 / 1024 / 1024).toFixed(1);
            const totalDisk = (disk.size / 1024 / 1024 / 1024).toFixed(1);
            diskInfoString += `[${disk.fs} 드라이브] 사용량 : ${usedDisk}GB / ${totalDisk}GB\n`;
        });

        diskInfoString = diskInfoString.substring(0, diskInfoString.length);

        printDataArr.push({name: "Disk 사용량", value: diskInfoString, inline: true});

        await sendMessage.edit("데이터 조회 성공 ✅");
        await channel.send({
            embed: {
                color: 3447003,
                fields: printDataArr
            }
        });
    }

    async linuxGetCpuGpuTemperature(): Promise<ResultVo> {
        return new Promise((resolve, reject) => {
            let cpuTemper, gpuTemper: string;
            command.exec("vcgencmd measure_temp", (err, stdout, stderr) => {
                if (err || stderr) {
                    reject({
                        state: "error",
                        data: "Parse Error"
                    });
                }

                gpuTemper = stdout.substring(5);

                command.exec("cat /sys/class/thermal/thermal_zone0/temp", (err, stdout, stderr) => {
                    if (err || stderr) {
                        reject({
                            state: "error",
                            data: "Parse Error"
                        });
                    }

                    cpuTemper = (parseInt(stdout) / 1000).toFixed(1) + "'C";

                    resolve({
                        state: "success",
                        data: {
                            cpu: cpuTemper,
                            gpu: gpuTemper
                        }
                    });
                });
            });
        });
    }
}

export interface ResultVo {
    state: string,
    data: {
        cpu: string,
        gpu: string
    }
}