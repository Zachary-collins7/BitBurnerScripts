import { NS } from "ns";
import { constants } from "lib/constants";
// import Colors = Constants.Colors;
// import Home = Constants.Home;
// import LogLevel = Constants.LogLevel;

type FunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type NSFunction = FunctionKeys<NS>;

export function createUTCDateTimeString(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hour = String(now.getUTCHours()).padStart(2, "0");
    const minute = String(now.getUTCMinutes()).padStart(2, "0");
    const second = String(now.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}
export function parseUTCDateTimeString(datetime: string): Date {
    const year = +datetime.substring(0, 4);
    const month = +datetime.substring(5, 7);
    const day = +datetime.substring(8, 10);
    const hour = +datetime.substring(11, 13);
    const minute = +datetime.substring(14, 16);

    return new Date(Date.UTC(year, month - 1, day, hour, minute));
}
export async function getOldTmpFiles(
    ns: NS,
    timeDeltaMS: number
): Promise<string[]> {
    const thresholdDate = new Date(
        new Date(
            Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate(),
                new Date().getUTCHours(),
                new Date().getUTCMinutes(),
                new Date().getUTCSeconds(),
                new Date().getUTCMilliseconds()
            )
        ).getTime() - timeDeltaMS
    );

    return (await _nsFunctionCaller(ns, false, "ls", "home", "tmp/"))
        .filter((f) => f.length > 16) // we know the date long
        .map((filePath) => ({
            filePath,
            fileDateStr: filePath.substring(4).split("_")[0],
        }))
        .filter(({ fileDateStr }) => {
            const dateTimeString = fileDateStr.match(
                /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).*/
            );
            // Skip files with invalid date-time prefixes
            if (!dateTimeString) return false;

            const fileDate = parseUTCDateTimeString(fileDateStr);

            return fileDate < thresholdDate;
        })
        .map(({ filePath }) => filePath);
}

export async function deleteFiles(ns: NS, files: string[]) {
    if (files.length === 0) return;
    const cleanScriptExists = await _nsFunctionCaller(
        ns,
        false,
        "fileExists",
        "tmp/clean.js"
    );
    if (!cleanScriptExists) {
        ns.write(
            "tmp/clean.js",
            `
            export async function main(ns) {
                for (const fileName of ns.args) {
                    if (typeof fileName !== "string") {
                        continue;
                    }
                    ns.rm(fileName);
                }
            }
            `
        );
    }
    ns.run("tmp/clean.js", 1, ...files);
}

async function _nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    cleanUpTmp: boolean = true,
    nsFunc: T,
    ...args: Parameters<NS[T]>
): Promise<ReturnType<NS[T]>> {
    const timeoutDelta = 10000; // 10 seconds
    const datetime = createUTCDateTimeString();
    const randomString = Math.random().toString(36).substring(2, 18);
    const runTmpFile = `tmp/${datetime}_${randomString}.js`;
    const outputTmpFile = `tmp/${datetime}_${randomString}.txt`;

    // clean up tmp files older than timeoutDelta + 1 second
    if (cleanUpTmp) {
        const oldTmpFiles = await getOldTmpFiles(ns, timeoutDelta + 1000);
        await deleteFiles(ns, oldTmpFiles);
    }

    const parseArgs = (args: Parameters<NS[T]>) => {
        return args.map((arg: any) => {
            if (typeof arg === "string") {
                return `"${arg}"`;
            } else {
                return arg;
            }
        });
    };

    const script = `
        export async function main(ns) {
            try {
                const ret = await ns.${nsFunc}(${parseArgs(args)});
                ns.write("${outputTmpFile}", JSON.stringify(ret));
            }
            catch (e) {
                ns.write("${outputTmpFile}", "ERROR: " + e);
            }
        }
    `;

    const timeout = Date.now() + timeoutDelta; // 10 seconds
    ns.write(runTmpFile, script);
    ns.run(runTmpFile);

    // wait for output file to be created or throw error if timeout
    while (!ns.read(outputTmpFile)) {
        if (Date.now() > timeout) {
            throw new Error(`Timeout waiting for output file ${outputTmpFile}`);
        }
        await ns.sleep(constants.scriptExecuteTime * 2);
    }

    // read output
    const output = ns.read(outputTmpFile);

    // return or throw parsed output
    if (output.startsWith("ERROR")) {
        throw new Error(output);
    }
    try {
        return JSON.parse(output);
    } catch (e) {
        throw new Error(`Could not parse output: ${output} ${e}`);
    }
}

// export function for use in scripts, defaulting to clean up tmp files
export async function nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    nsFunc: T,
    ...args: Parameters<NS[T]>
): Promise<ReturnType<NS[T]>> {
    return _nsFunctionCaller(ns, true, nsFunc, ...args);
}
