import { NS } from "ns";
import { constants } from "lib/constants";

export async function main(ns: NS) {
    var target = ns.args[0] as constants.anyTarget;
    try {
        ns.brutessh(target);
    } catch {}
    try {
        ns.ftpcrack(target);
    } catch {}
    try {
        ns.relaysmtp(target);
    } catch {}
    try {
        ns.httpworm(target);
    } catch {}
    try {
        ns.sqlinject(target);
    } catch {}
    try {
        ns.nuke(target);
    } catch {}
}
