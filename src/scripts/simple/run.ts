import { NS } from "ns";
import { constants } from "lib/constants";
const { colors } = constants;

// 4.75GB GB

export async function main(ns: NS) {
    const targets = [
        ...constants.Target.Level0,
        ...constants.Target.Level1,
        ...constants.Target.Level2,
        ...constants.Target.Level3,
    ];

    const hackScript = "scripts/simple/hack.js";

    while (true) {
        const numberOfHacksOwned = (ns: NS) =>
            [
                "BruteSSH.exe",
                "FTPCrack.exe",
                "relaySMTP.exe",
                "HTTPWorm.exe",
                "SQLInject.exe",
            ]
                .map((f) => ns.fileExists(f))
                .filter(Boolean).length;

        const hacksOwned = numberOfHacksOwned(ns);

        const hackingLevel = ns.getHackingLevel();
        for (const target of targets) {
            if (
                ns.hasRootAccess(target) ||
                hackingLevel < ns.getServerRequiredHackingLevel(target) ||
                ns.getServerNumPortsRequired(target) > hacksOwned
            )
                continue;

            let tries = 3;
            while (!ns.hasRootAccess(target) && tries-- > 0) {
                ns.tprint(`Getting root access on ${target}`);
                ns.exec("scripts/util/nuke.js", "home", 1, target);
                await ns.sleep(10000);
            }

            ns.scp(hackScript, target, "home");

            const scriptRam = ns.getScriptRam(hackScript, target);
            const serverMaxRam = ns.getServerMaxRam(target);
            const threads = Math.floor(serverMaxRam / scriptRam);

            ns.tprint(
                `Starting ${colors.brightGreen}${threads}${colors.default}` +
                    ` threads on ${colors.brightRed}${target}${colors.default}`
            );

            const args = [
                target,
                ns.getServerMaxMoney(target),
                ns.getServerMinSecurityLevel(target),
                `threads=${threads}`,
            ];
            ns.killall(target);
            ns.exec(hackScript, target, threads, ...args);
        }
        await ns.sleep(10000);
    }
}
