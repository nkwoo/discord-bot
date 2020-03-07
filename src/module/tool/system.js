import * as system from "systeminformation";
import * as command from "child_process";

export async function getSystemState(message) {
    let printDataArr = [];

    let sendMessage = await message.channel.send("데이터 조회중......");

    const serverOsInfo = await system.osInfo();
    const serverCpuInfo = await system.cpu();
    //const serverCpuTemperature = await system.cpuTemperature();
    //TODO 타 OS 온도 지원
    const serverMemory = await system.mem();
    const serverDiskInfo = await system.fsSize();
    
    const usedMemory = (serverMemory.used / 1024 / 1024 / 1024).toFixed(1);
    const totalMemory = (serverMemory.total / 1024 / 1024 / 1024).toFixed(1);

    printDataArr.push({name: "OS 정보", value: serverOsInfo.distro});
    printDataArr.push({name: "CPU 정보", value: `${serverCpuInfo.manufacturer} ${serverCpuInfo.brand}`});


    if (serverOsInfo.logofile == "raspbian") {
        const linuxTemper = await linuxGetCpuGpuTemperature();

        if (linuxTemper.state == "success") {
            printDataArr.push({name: "CPU 온도", value: linuxTemper.data.cpu});
            printDataArr.push({name: "GPU 온도", value: linuxTemper.data.gpu});
        } else {
            printDataArr.push({name: "CPU 온도", value: "미지원"});
            printDataArr.push({name: "GPU 온도", value: "미지원"});
        }
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

    sendMessage.edit("데이터 조회 성공 ✅");
    message.channel.send({
        embed: {
            color: 3447003,
            fields: printDataArr
        }
    });
    
}

function linuxGetCpuGpuTemperature() {
    return new Promise(function(resolve, reject) {
        let cpuTemper, gpuTemper;
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

                cpuTemper = (stdout / 1000).toFixed(1) + "'C";

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