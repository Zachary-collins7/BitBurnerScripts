import { NS } from "ns";

export async function main(ns: NS) {
    const hostname = ns.getHostname();
    const commands = ns
        .ls(hostname)
        .map((filePath) => ({ filePath, path: filePath.split("/") }))
        // alias all in bin/
        .filter(({ path }) => path && path[0] === "bin" && path.length === 2);

    ns.alert(
        "Copy and paste the following into the terminal to alias\n\n" +
            commands
                .map(({ filePath, path }) => {
                    const commandName = path[1].split(".")[0].replace(".", "_");
                    return `alias ${commandName}="run ${filePath}"`;
                })
                .join("; ")
    );
}
