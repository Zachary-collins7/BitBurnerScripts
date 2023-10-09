# NEW README

## Installation

> `npm ci`

# Update types for game (if game updates)

download `src/ScriptEditor/NetscriptDefinitions.d.ts` from this
[raw file](https://raw.githubusercontent.com/bitburner-official/bitburner-src/dev/src/ScriptEditor/NetscriptDefinitions.d.ts)
or clone from the
[bitburner-src](https://github.com/bitburner-official/bitburner-src)
repo

create file in `src/lib/ns.t.ts` and add the following

```ts
declare module "ns" {
    // paste contents of NetscriptDefinitions.d.ts here
}
```

For every `declare enum` type you will have to remove the `declare ` keyword, leaving only `enum`.

> you can easily do this with find and replace

# Set up the bitburner vscode extension

#### In vscode

-   download the extention from the marketplace `Bitburner VSCode Integration`
-   create file at path `.vscode/settings.json`
-   add the following to the new file
    ```json
    {
        "bitburner.scriptRoot": "./build/"
    }
    ```

#### Now go to the game

In the Bitburner application 'API Server' context menu (top of screen when the application is selected) click the following:

-   `API Server -> Enable Server`
-   `API Server -> Enable AutoStart`
-   `API Server -> Copy Auth Token`

#### Back in vscode

open the command palette `(CTRL/CMD + SHIFT + P)` and select `Bitburner: Add Auth Token` and paste the token you just copied

> this will add `bitburner.authToken` to your `.vscode/settings.json` file

in the command pallette again: run `Bitburner: Enable File Watcher`

# Build the project

The File Watcher was inconsistant for me so I created a build task to compile and push the code.

> If the code auto pushes on `npm build` feel free to just use that

#### Enable the build task

-   open the command pallette and select `Tasks: Configure Default Build Task`

-   make sure `Build and Push Bitburner project` is at the top (and selected)

now when you build the project `(CTRL/CMD + SHIFT + B)`, the code will both compile and force push to the game.

#### In the game

running `ls` should now some new directories and files

![what the game shows when you run ls](images/on_init_file_sync.png?raw=true "on_init_file_sync")

## Aliases

#### rmAllScripts

## Notes about scripts

#### scripts will not be auto-deleted

if I create `src/main.ts` and push the code but later decide to rename the file to `src/main_script.ts`, BOTH `main.ts` and `main_script.ts` will exist in the bitburner root dir. To fix this use [rmAllScripts](#rmAllScripts) in [Aliases](#Aliases)
