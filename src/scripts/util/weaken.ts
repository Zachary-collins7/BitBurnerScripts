import { NS } from "ns";

export async function main(ns: NS) {
    for (let i = 0; i <= (ns.args[1] as number) || 1; i++) {
        await ns.weaken(ns.args[0] as string);
    }
}
