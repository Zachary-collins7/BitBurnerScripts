import { NS } from "ns";
import { constants } from "lib/constants";

export async function main(ns: NS) {
    // const target: constants.level0Target = constants.Target.Level0[0];
    const target = ns.args[0] as constants.someLevelTarget;
    const moneyThresh = (ns.args[1] as number) * 0.75;
    const securityThresh = (ns.args[2] as number) + 5;

    // Infinite loop that continously hacks/grows/weakens the target server
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            await ns.hack(target);
        }
    }
}
