import { NS } from "ns";
import { constants } from "lib/constants";
const { Colors } = constants;

// 4.75GB GB

export async function main(ns: NS) {
    const targets = [
        ...constants.Target.Level0,
        ...constants.Target.Level1,
        ...constants.Target.Level2,
        ...constants.Target.Level3,
    ];

    const hackScript = "scripts/simple/hack.js";

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

    for (const target of targets) {
        if (
            ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target) ||
            ns.getServerNumPortsRequired(target) > numberOfHacksOwned(ns)
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
            `Starting ${Colors.brightGreen}${threads}${Colors.default}` +
                ` threads on ${Colors.brightRed}${target}${Colors.default}`
        );
        ns.killall(target);

        const args = [
            target,
            ns.getServerMaxMoney(target),
            ns.getServerMinSecurityLevel(target),
            `threads=${threads}`,
        ];

        ns.exec(hackScript, target, threads, ...args);
    }
    ns.tprint("Done!");
}
