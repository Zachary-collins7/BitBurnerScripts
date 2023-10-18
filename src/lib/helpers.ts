import { NS } from "ns";
import { constants } from "lib/constants";

// type extracts the return type of a readonly array of functions
type ExtractReturnTypes<T extends readonly ((i: any) => any)[]> = [
    ...{
        [K in keyof T]: T[K] extends (i: any) => infer R ? R : never;
    }
];

// get all keys of an object that are functions
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

const tmpFilesClearToDelete = new Set<string>();
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
        .filter(({ filePath, fileDateStr }) => {
            // check to see if the file has already been marked for deletion
            if (tmpFilesClearToDelete.has(filePath)) {
                tmpFilesClearToDelete.delete(filePath);
                return true;
            }

            // regex the name to check for a tmp file we created
            const dateTimeString = fileDateStr.match(
                /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}).*/
            );
            if (!dateTimeString) return false;

            // finally we check if the file has expired
            const fileDate = parseUTCDateTimeString(fileDateStr);
            return fileDate < thresholdDate;
        })
        .map(({ filePath }) => filePath);
}

export async function deleteFiles(ns: NS, files: string[]) {
    if (files.length === 0) return;
    // TODO: fix this
    // clean script has to make tmp file to delete tmp files but doesnt immediately
    // delete new tmp file
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

    const batchSize = 25;
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        ns.print(`Deleting ${batch.length} files`);
        ns.run("tmp/clean.js", 1, ...batch);
        await ns.sleep(constants.scriptExecuteTime * 2);
    }
}

export async function deleteOldTmpFiles(
    ns: NS,
    timeoutDeltaMS: number = 10000
) {
    const oldTmpFiles = await getOldTmpFiles(ns, timeoutDeltaMS + 1000);
    await deleteFiles(ns, oldTmpFiles);
}

/*
 * Functions above this line are dependencies of _nsFunctionCaller and are required
 * to pass clean = false to prevent infinite recursion
 */

async function _nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    cleanUpTmp: boolean,
    nsFunc: T,
    ..._args: Parameters<NS[T]>
): Promise<ReturnType<NS[T]>>;
async function _nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    cleanUpTmp: boolean,
    nsFunc: T,
    ..._args: [Parameters<NS[T]>[]]
): Promise<ReturnType<NS[T]>[]>;
async function _nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    cleanUpTmp: boolean = true,
    nsFunc: T,
    ..._args: Parameters<NS[T]> | [Parameters<NS[T]>[]]
): Promise<ReturnType<NS[T]> | ReturnType<NS[T]>[]> {
    // if calling function once, _args will be an array like
    // [arg1, arg2, arg3, ...] type Parameters<NS[T]>
    // if calling function multiple times, _args will be an array like
    // [[[arg1, arg2, arg3, ...], [arg1, arg2, arg3, ...], ...]] type [Parameters<NS[T]>[]]
    const timeoutDelta = 10000; // 10 seconds
    const datetime = createUTCDateTimeString();
    const randomString = Math.random().toString(36).substring(2, 18);
    const runTmpFile = `tmp/${datetime}_${randomString}.js` as const;
    const outputTmpFile = `tmp/${datetime}_${randomString}.txt` as const;

    // is true if function is meant to be called multiple times
    const isManyArgs =
        _args.length > 0 &&
        Array.isArray(_args[0]) &&
        _args[0].every(Array.isArray);

    // make args consistent
    // if _args is [arg1, arg2, arg3, ...]
    // then args is [[arg1, arg2, arg3, ...]]
    // if _args is [[arg1, arg2, arg3, ...], [arg1, arg2, arg3, ...], ...]
    // then args is [[arg1, arg2, arg3, ...], [arg1, arg2, arg3, ...], ...]
    const args = isManyArgs
        ? (_args[0] as Parameters<NS[T]>[])
        : ([_args] as Parameters<NS[T]>);

    // on success; script will always write out array of return values
    // - return values will either be the return value of the function
    //   or the string "ERROR: " + error message
    // on fatal error; script will write out "FATAL_ERROR:" + the error message
    const script = `
        export async function main(ns) {
            try {
                const ret = []; // array of return values
                const manyArgs = ${isManyArgs};
                const argsArr = JSON.parse('${JSON.stringify(
                    args
                )}'); // fun parse action
                for (const args of argsArr) {
                    try {
                        if (args.length === 0) {
                            ret.push(await ns.${nsFunc}());   
                        } else {
                            ret.push(await ns.${nsFunc}(...args));
                        }
                    }
                    catch (e) {
                        ret.push("ERROR: " + e);
                    }
                }                
                ns.write("${outputTmpFile}", JSON.stringify(ret));
            } catch (e) {
                ns.write("${outputTmpFile}", "FATAL_ERROR: " + e);
            }
        }
    ` as const;

    // clean up tmp files older than timeoutDelta + 1 second
    // we do this first so that if we throw an error we have at least cleaned up
    if (cleanUpTmp) {
        await deleteOldTmpFiles(ns, timeoutDelta + 1000);
    }

    const scriptTimeout = Date.now() + timeoutDelta; // 10 seconds

    // write and run script
    ns.write(runTmpFile, script);
    ns.run(runTmpFile);

    // wait for output file to be created or throw error if timeout
    while (!ns.read(outputTmpFile)) {
        if (Date.now() > scriptTimeout) {
            // we only add run file to delete because we know
            // the output file doesn't exist
            tmpFilesClearToDelete.add(runTmpFile);
            throw new Error(
                `Timeout waiting for output file ${outputTmpFile} details:` +
                    `\n\tfn: ${nsFunc}\n\targs: ${args}`
            );
        }
        await ns.sleep(constants.scriptExecuteTime * 2);
    }

    // read output and clean up tmp files
    const rawOutput = ns.read(outputTmpFile);
    tmpFilesClearToDelete.add(runTmpFile);
    tmpFilesClearToDelete.add(outputTmpFile);

    // throw fatal errors
    if (rawOutput.startsWith("FATAL_ERROR")) {
        throw new Error(rawOutput);
    }

    // parsed output is always an array because of simplifying logic above
    const parsedOutput = JSON.parse(rawOutput);
    const output = isManyArgs
        ? (parsedOutput as ReturnType<NS[T]>[])
        : (parsedOutput[0] as ReturnType<NS[T]>);

    // throw error if only one arg and output is error
    if (!isManyArgs) {
        if (typeof output === "string" && output.startsWith("ERROR")) {
            throw new Error(output);
        }
    }
    return output;
}

// export function for use in scripts, defaulting to clean up tmp files
export async function nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    nsFunc: T,
    ..._args: Parameters<NS[T]>
): Promise<ReturnType<NS[T]>>;
export async function nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    nsFunc: T,
    ..._args: [Parameters<NS[T]>[]]
): Promise<ReturnType<NS[T]>[]>;
export async function nsFunctionCaller<T extends NSFunction>(
    ns: NS,
    nsFunc: T,
    ...args: Parameters<NS[T]> | [Parameters<NS[T]>[]]
): Promise<ReturnType<NS[T]> | ReturnType<NS[T]>[]> {
    if (args.length > 1 && args.every((arg) => Array.isArray(arg))) {
        return _nsFunctionCaller(
            ns,
            true,
            nsFunc,
            ...(args as [Parameters<NS[T]>[]])
        );
    }
    return _nsFunctionCaller(ns, true, nsFunc, ...(args as Parameters<NS[T]>));
}

/*
 * func group start
 * group would allow syntax like this:
 * const [a, b, c] = await nsFuncGroup(
 *   ns,
 *   nsFuncComponent(ns, "growthAnalyze", "n00dles", 1.5),
 *   nsFuncComponent(ns, "scan", "home"),
 *   nsFuncComponent(ns, "growthAnalyze", "n00dles", 1.5)
 * );
 * allowing multiple functions to be in a separate thread
 * this would mean the separate thread would need the additive ram of a set
 * of all functions in the group
 */

export type nsFuncComponent<T extends NSFunction> = {
    nsFunc: T;
    args: Parameters<NS[T]>;
    func: (...args: Parameters<NS[T]>) => ReturnType<NS[T]>;
};

export type nsFuncComponentReturnTypes<
    T extends readonly nsFuncComponent<NSFunction>[]
> = [
    ...{
        [K in keyof T]: T[K] extends nsFuncComponent<NSFunction>
            ? ReturnType<T[K]["func"]>
            : never;
    }
];

export function nsFuncComponent<T extends NSFunction>(
    ns: NS,
    nsFunc: T,
    ...args: Parameters<NS[T]>
): nsFuncComponent<T> {
    return {
        nsFunc,
        args,
        func: () => null as ReturnType<NS[T]>,
    };
}

export async function nsFuncGroup<
    T extends readonly nsFuncComponent<NSFunction>[]
>(ns: NS, ...funcs: T): Promise<nsFuncComponentReturnTypes<T>> {
    return null as any;
}

/*
 * func group end
 */

export async function scanMap(ns: NS): Promise<{
    targets: constants.TargetDetails[];
    nodeMap: { [server: string]: string[] };
}> {
    const seen = new Set<string>();
    // a map of server to servers it directly connects to
    const nodeMap: {
        [server: string]: string[];
    } = {};

    // recursive scan
    const scan_recursive = async (server: string) => {
        if (seen.has(server)) return;
        ns.tprint(`Scanning ${server}`);
        seen.add(server);
        const servers = await nsFunctionCaller(ns, "scan", server);
        nodeMap[server] = servers;
        for (const s of servers) {
            await scan_recursive(s);
        }
    };

    await scan_recursive("home");

    const targets: constants.TargetDetails[] = [];
    for (const serverName of Object.keys(nodeMap)) {
        const server = serverName as constants.anyTarget;

        const newDetails: constants.TargetDetails = {
            name: server,
            rootAccess: null,
            ram: await nsFunctionCaller(ns, "getServerMaxRam", server),
            hack: {
                time: await nsFunctionCaller(ns, "getHackTime", server),
                securityIncrease: await nsFunctionCaller(
                    ns,
                    "hackAnalyzeSecurity",
                    1,
                    server
                ),
                moneyPercentStolen: await nsFunctionCaller(
                    ns,
                    "hackAnalyze",
                    server
                ),
                chance: await nsFunctionCaller(ns, "hackAnalyzeChance", server),
            },
            grow: {
                time: await nsFunctionCaller(ns, "getGrowTime", server),
                securityIncrease: await nsFunctionCaller(
                    ns,
                    "growthAnalyzeSecurity",
                    1,
                    server
                ),
                threadCalc(targetMultiplier: number): Promise<number> {
                    return nsFunctionCaller(
                        ns,
                        "growthAnalyze",
                        server,
                        targetMultiplier
                    );
                },
            },
            weaken: {
                time: await nsFunctionCaller(ns, "getWeakenTime", server),
                securityDecrease: await nsFunctionCaller(
                    ns,
                    "weakenAnalyze",
                    1,
                    1
                ),
            },
        };
        targets.push(newDetails);
    }

    return { targets, nodeMap };
}

export async function deepScan(
    ns: NS,
    hostname: string = "home"
): Promise<string[]> {
    const seen = new Set<string>();
    const recursiveScan = async (server: string) => {
        if (seen.has(server)) return;
        seen.add(server);
        const servers = await nsFunctionCaller(ns, "scan", server);
        for (const s of servers) {
            await recursiveScan(s);
        }
    };
    await recursiveScan(hostname);
    return Array.from(seen);
}

export async function onlyOneInstance(ns: NS): Promise<boolean> {
    const thisScript = ns.getScriptName();
    const processes = await nsFunctionCaller(ns, "ps");

    const thisScriptProcessCount = processes
        .map((p) => p.filename)
        .filter((f) => f === thisScript).length;
    if (thisScriptProcessCount > 1) {
        throw new Error(`Script ${thisScript} is already running`);
    }
    return true;
}
