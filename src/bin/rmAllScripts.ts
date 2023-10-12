import { NS } from "ns";

export async function main(ns: NS) {
    const hostname = ns.getHostname();
    ns.ls(hostname).forEach((filePath) => {
        // if file is in /bin/, skip it
        if (filePath.startsWith("bin/") || filePath.startsWith("/bin/")) return;

        // if file ends in .js or .ns, delete it
        if (filePath.endsWith(".js") || filePath.endsWith(".ns")) {
            ns.tprint(`Deleting ${filePath}`);
            ns.rm(filePath);
        } else {
            ns.tprint(`Skipping ${filePath}`);
        }
    });

    ns.tprint("Done!");
}
