# NEW README

# Requirements

-   node
-   [bitburner](https://store.steampowered.com/app/1812820/Bitburner/) installed on steam
-   [vscode](https://code.visualstudio.com)

# Installation

## Clone

#### Git clone this repo

```bash
git clone https://github.com/Zachary-collins7/BitBurnerScripts.git
# or
git clone git@github.com:Zachary-collins7/BitBurnerScripts.git
```

## Npm packages

#### install typescript globally

```bash
npm i -g typescript
```

#### Install npm dependencies

```bash
npm ci
```

## Set up the bitburner vscode extension

#### In vscode

-   download the extention from the marketplace `Bitburner VSCode Integration`
-   create `.vscode/settings.json` file
    ```bash
    mkdir .vscode && touch .vscode/settings.json
    ```
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

## Add vscode task

The Bitburner File Watcher was inconsistant for me so I created a build task to compile and push the code.

-   create `.vscode/tasks.json` file
    ```bash
    mkdir .vscode && touch .vscode/tasks.json
    ```
-   add the following to the new file
    ```json
    {
        // See https://go.microsoft.com/fwlink/?LinkId=733558
        // for the documentation about the tasks.json format
        "version": "2.0.0",
        "tasks": [
            {
                "label": "Build Npm Project",
                "type": "npm",
                "script": "build"
            },
            {
                "label": "Build and Push Bitburner project",
                "dependsOn": ["Build Npm Project"],
                "presentation": {
                    "reveal": "always",
                    "panel": "shared"
                },
                "command": ["${command:ext.bitburner-connector.pushAllFiles}"],
                "problemMatcher": [],
                "group": {
                    "kind": "build",
                    "isDefault": true
                }
            }
        ]
    }
    ```

#### Enable the build task

-   open the command pallette and select `Tasks: Configure Default Build Task`

-   make sure `Build and Push Bitburner project` is at the top (and selected)

> now when you build the project `(CTRL/CMD + SHIFT + B)`, the code will both compile and force push to the game.

## Verify Installation

running `ls` should now some new directories and files

![what the game shows when you run ls](images/on_init_file_sync.png?raw=true "on_init_file_sync")

# Scripting

all files and directories in the `src` directory are copied to the root directory of the game. Example `src/myScript.ts` gets compiled and pushed to `/myScript.js`

`src/lib` has some helpful methods and constants for scripting and debugging. The [tsconfig](tsconfig.json) aliases them for easy import under `@lib`.

`src/scripts` is to prevent the root dir from being overcrowded. most scripts should go here

`src/bin` has all of the [alias](#aliases) scripts. scripts here are intended to be used as terminal commands. Example [rmAllScripts](#rmallscripts) is a script that helps clear all old files.

## Notes about syncing scripts

#### Scripts will not be auto-deleted

if you create `src/main.ts` and push the code but later decide to rename the file to `src/main_script.ts`, BOTH `main.js` and `main_script.js` will exist in the bitburner root dir. To fix this use [rmAllScripts](#rmAllScripts) in [Aliases](#Aliases)

# Aliases

-   ### aliasBin
    -   args: `none`
    -   desc: prompts user with command(s) to alias all scripts in `/bin`. example: `alias aliasBin="run bin/aliasBin --tail"`
-   ### unaliasBin
    -   args: `none`
    -   desc: prompts user with command(s) to unalias all scripts in `/bin`. functional opposite to `aliasBin`
-   ### rmAllScripts
    -   args: `none`
    -   desc: recursively removes all `.js` or `.ns` files in any directory except `/bin` (`/bin/**/*`). the intended use case is to `rmAllScripts`` and then build (and push) the new code

# Update types for game (if game updates)

-   download `src/ScriptEditor/NetscriptDefinitions.d.ts` from this
    [raw file link](https://raw.githubusercontent.com/bitburner-official/bitburner-src/dev/src/ScriptEditor/NetscriptDefinitions.d.ts)
    or clone from the
    [bitburner-src](https://github.com/bitburner-official/bitburner-src)
    repo

-   clear file `src/lib/ns.t.ts`
    ```bash
    rm src/types/ns.t.ts; touch src/types/ns.t.ts
    ```
    and add the following
    ```ts
    declare module "ns" {
        // paste here
    }
    ```
-   paste the contents of `NetscriptDefinitions.d.ts` inside the module above

-   For every `declare enum` type you will have to remove the `declare ` keyword, leaving only `enum`.

    > you can easily do this with find and replace
