export module constants {
    export const Home = "home";

    // from settings, usually multiply by 2 to get safe value
    export const scriptExecuteTime = 25;

    export const myScripts = {
        util: {
            grow: {
                filename: "util/grow.js",
            },
            hack: {
                filename: "util/hack.js",
            },
            weaken: {
                filename: "util/weaken.js",
            },
            nuke: {
                filename: "util/nuke.js",
            },
        },
    };

    export const Target = {
        Level0: [
            "n00dles",
            "joesguns",
            "foodnstuff",
            "hong-fang-tea",
            "harakiri-sushi",
            "sigma-cosmetics",
        ] as const,
        Level1: ["zer0", "neo-net", "iron-gym", "max-hardware"] as const,
        Level2: [
            "phantasy",
            "omega-net",
            "avmnite-02h",
            "silver-helix",
        ] as const,
        Level3: [
            "netlink",
            "I.I.I.I",
            "catalyst",
            "summit-uni",
            "rothman-uni",
            "rho-construction",
        ] as const,
        Valuable: [
            ".",
            "nwo",
            "blade",
            "4sigma",
            "icarus",
            "the-hub",
            "phantasy",
            "deltaone",
            "zeus-med",
            "megacorp",
            "alpha-ent",
            "unitalife",
            "stormtech",
            "kuai-gong",
            "univ-energy",
            "fulcrumtech",
            "rho-construction",
        ] as const,
    };
    export type level0Target = (typeof Target.Level0)[number];
    export type level1Target = (typeof Target.Level1)[number];
    export type level2Target = (typeof Target.Level2)[number];
    export type level3Target = (typeof Target.Level3)[number];
    export type someLevelTarget =
        | (typeof Target.Level0)[number]
        | (typeof Target.Level1)[number]
        | (typeof Target.Level2)[number]
        | (typeof Target.Level3)[number];
    export type valuableTarget = (typeof Target.Valuable)[number];
    export type anyTarget = someLevelTarget | valuableTarget;

    export type TargetDetails = {
        name: string;
        rootAccess: boolean | null;
        ram: number;
        hack: {
            time: number;
            securityIncrease: number;
            moneyPercentStolen: number;
            chance: number;
        };
        grow: {
            time: number;
            securityIncrease: number;
            threadCalc: (targetMultiplier: number) => number;
        };
        weaken: {
            time: number;
            securityDecrease: number;
        };
    };

    export enum ServerSize {
        G1 = 1,
        G2 = 1 << 1,
        G4 = 1 << 2,
        G8 = 1 << 3,
        G16 = 1 << 4,
        G32 = 1 << 5,
        G64 = 1 << 6,
        G128 = 1 << 7,
        G256 = 1 << 8,
        G512 = 1 << 9,
        T1 = 1 << 10,
        T2 = 1 << 11,
        T4 = 1 << 12,
        T8 = 1 << 13,
        T16 = 1 << 14,
        T32 = 1 << 15,
        T64 = 1 << 16,
        T128 = 1 << 17,
        T256 = 1 << 18,
        T512 = 1 << 19,
        P1 = 1 << 20,
    }

    // namespace for all stock related constants
    export const stock = {
        symbols: [
            "BLD",
            "CTK",
            "ECP",
            "FNS",
            "GPH",
            "KGI",
            "STM",
            "HLS",
            "OMN",
            "JGN",
            "LXO",
            "SGC",
            "UNV",
            "WDS",
            "AERO",
            "CLRK",
            "FSIG",
            "FLCM",
            "MGCP",
            "OMTK",
            "VITA",
            "ICRS",
            "SLRS",
            "NVMD",
            "RHOC",
            "APHE",
            "SYSC",
            "NTLK",
            "OMGA",
            "CTYS",
            "MDYN",
            "TITN",
            "DCOMM",
        ] as const,
        orderTypes: ["limitbuy", "limitsell", "stopbuy", "stopsell"] as const,
        orderPositions: ["long", "short"] as const,
    };
    export type StockSymbol = (typeof stock.symbols)[number];
    export type StockOrderType = (typeof stock.orderTypes)[number];
    export type StockOrderPosition = (typeof stock.orderPositions)[number];

    export const university = {
        courses: [
            "Networks",
            "Algorithms",
            "Management",
            "Leadership",
            "Data Structures",
            "Study Computer Science",
        ] as const,
        list: [
            "Summit University",
            "Rothman University",
            "ZB Institute Of Technology",
        ] as const,
    };
    export type University = (typeof university.list)[number];
    export type UniversityCourse = (typeof university.courses)[number];

    export const gym = {
        list: [
            "Iron Gym",
            "Powerhouse Gym",
            "Snap Fitness Gym",
            "Crush Fitness Gym",
            "Millenium Fitness Gym",
        ] as const,
        stats: ["str", "def", "dex", "agi"] as const,
    };
    export type Gym = (typeof gym.list)[number];
    export type GymStat = (typeof gym.stats)[number];

    export const cities = [
        "Aevum",
        "Ishima",
        "Volhaven",
        "Chongqing",
        "Sector-12",
        "New Tokyo",
    ] as const;
    export type City = (typeof cities)[number];

    export enum PurchasableProgram {
        AutoLink = "AutoLink.exe",
        DeepScanV1 = "DeepScanV1.exe",
        BruteSSH = "BruteSSH.exe",
        FTPCrack = "FTPCrack.exe",
        RelaySMTP = "relaySMTP.exe",
        HTTPWorm = "HTTPWorm.exe",
        SQLInject = "SQLInject.exe",
        DeepScanV2 = "DeepScanV2.exe",
    }

    export type CreatableProgram = PurchasableProgram | "serverprofiler.exe";

    export const company = {
        list: [
            // sector-12
            "CIA",
            "NSA",
            "DeltaOne",
            "MegaCorp",
            "JoesGuns",
            "FourSigma",
            "FoodNStuff",
            "BladeIndustries",
            "UniversalEnergy",
            "AlphaEnterprises",
            "IcarusMicrosystems",
            "CarmichaelSecurity",
            // aevum
            "ECorp",
            "AeroCorp",
            "AevumPolice",
            "RhoConstruction",
            "WatchdogSecurity",
            "ClarkeIncorporated",
            "NetLinkTechnologies",
            "OmniTekIncorporated",
            "FulcrumTechnologies",
            "BachmanAndAssociates",
            "GalacticCybersystems",
            // Volhaven
            "NWO",
            "CompuTek",
            "LexoCorp",
            "HeliosLabs",
            "OmniaCybersystems",
            "SysCoreSecurities",
            // Chongqing
            "SolarisSpaceSystems",
            "KuaiGongInternational",
            // Ishima
            "NovaMedical",
            "OmegaSoftware",
            "StormTechnologies",
            // New Tokyo
            "DefComm",
            "VitaLife",
            "NoodleBar",
            "GlobalPharmaceuticals",
        ] as const,
        fields: [
            "it",
            "agent",
            "waiter",
            "security",
            "employee",
            "software",
            "business",
            "network engineer",
            "part-time waiter",
            "security engineer",
            "software consultant",
            "business consultant",
            "part-time employee",
        ] as const,
    };
    export type Company = (typeof company.list)[number];
    export type CompanyField = (typeof company.fields)[number];

    export const faction = {
        list: [
            ,
            "Illuminati",
            "Daedalus",
            "The Covenant",
            "ECorp",
            "MegaCorp",
            "Bachman & Associates",
            "Blade Industries",
            "NWO",
            "Clarke Incorporated",
            "OmniTek Incorporated",
            "Four Sigma",
            "KuaiGong International",
            "Fulcrum Secret Technologies",
            "BitRunners",
            "The Black Hand",
            "NiteSec",
            "Aevum",
            "Chongqing",
            "Ishima",
            "New Tokyo",
            "Sector-12",
            "Volhaven",
            "Speakers for the Dead",
            "The Dark Army",
            "The Syndicate",
            "Silhouette",
            "Tetrads",
            "Slum Snakes",
            "Netburners",
            "Tian Di Hui",
            "CyberSec",
            "Bladeburners",
        ] as const,
        workTypes: ["hacking", "field", "security"] as const,
    };
    export type Faction = (typeof faction.list)[number];
    export type FactionWork = (typeof faction.workTypes)[number];

    export const gang = {
        list: [
            "Slum Snakes",
            "Tetrads",
            "The Syndicate",
            "The Dark Army",
            "Speakers for the Dead",
            "NiteSec",
            "The Black Hand",
        ] as const,
        crimeTypes: [
            "shoplift",
            "rob store",
            "mug",
            "larceny",
            "deal drugs",
            "bond forgery",
            "traffick arms",
            "homicide",
            "grand theft auto",
            "kidnap",
            "assassinate",
            "heist",
        ] as const,
    };
    export type Gang = (typeof gang.list)[number];
    export type GangCrime = (typeof gang.crimeTypes)[number];

    export const augments = [
        "Augmented Targeting I",
        "Augmented Targeting II",
        "Augmented Targeting III",
        "Synthetic Heart",
        "Synfibril Muscle",
        "Combat Rib I",
        "Combat Rib II",
        "Combat Rib III",
        "Nanofiber Weave",
        "NEMEAN Subdermal Weave",
        "Wired Reflexes",
        "Graphene Bone Lacings",
        "Bionic Spine",
        "Graphene Bionic Spine Upgrade",
        "Bionic Legs",
        "Graphene Bionic Legs Upgrade",
        "Speech Processor Implant",
        "TITN-41 Gene-Modification Injection",
        "Enhanced Social Interaction Implant",
        "BitWire",
        "Artificial Bio-neural Network Implant",
        "Artificial Synaptic Potentiation",
        "Enhanced Myelin Sheathing",
        "Synaptic Enhancement Implant",
        "Neural-Retention Enhancement",
        "DataJack",
        "Embedded Netburner Module",
        "Embedded Netburner Module Core Implant",
        "Embedded Netburner Module Core V2 Upgrade",
        "Embedded Netburner Module Core V3 Upgrade",
        "Embedded Netburner Module Analyze Engine",
        "Embedded Netburner Module Direct Memory Access Upgrade",
        "Neuralstimulator",
        "Neural Accelerator",
        "Cranial Signal Processors - Gen I",
        "Cranial Signal Processors - Gen II",
        "Cranial Signal Processors - Gen III",
        "Cranial Signal Processors - Gen IV",
        "Cranial Signal Processors - Gen V",
        "Neuronal Densification",
        "Nuoptimal Nootropic Injector Implant",
        "Speech Enhancement",
        "FocusWire",
        "PC Direct-Neural Interface",
        "PC Direct-Neural Interface Optimization Submodule",
        "PC Direct-Neural Interface NeuroNet Injector",
        "ADR-V1 Pheromone Gene",
        "ADR-V2 Pheromone Gene",
        "The Shadow's Simulacrum",
        "Hacknet Node CPU Architecture Neural-Upload",
        "Hacknet Node Cache Architecture Neural-Upload",
        "Hacknet Node NIC Architecture Neural-Upload",
        "Hacknet Node Kernel Direct-Neural Interface",
        "Hacknet Node Core Direct-Neural Interface",
        "NeuroFlux Governor",
        "Neurotrainer I",
        "Neurotrainer II",
        "Neurotrainer III",
        "HyperSight Corneal Implant",
        "LuminCloaking-V1 Skin Implant",
        "LuminCloaking-V2 Skin Implant",
        "HemoRecirculator",
        "SmartSonar Implant",
        "Power Recirculation Core",
        "QLink",
        "The Red Pill",
        "SPTN-97 Gene Modification",
        "ECorp HVMind Implant",
        "CordiARC Fusion Reactor",
        "SmartJaw",
        "Neotra",
        "Xanipher",
        "nextSENS Gene Modification",
        "OmniTek InfoLoad",
        "Photosynthetic Cells",
        "BitRunners Neurolink",
        "The Black Hand",
        "CRTX42-AA Gene Modification",
        "Neuregen Gene Modification",
        "CashRoot Starter Kit",
        "NutriGen Implant",
        "INFRARET Enhancement",
        "DermaForce Particle Barrier",
        "Graphene BranchiBlades Upgrade",
        "Graphene Bionic Arms Upgrade",
        "BrachiBlades",
        "Bionic Arms",
        "Social Negotiation Assistant (S.N.A)",
        "EsperTech Bladeburner Eyewear",
        "EMS-4 Recombination",
        "ORION-MKIV Shoulder",
        "Hyperion Plasma Cannon V1",
        "Hyperion Plasma Cannon V2",
        "GOLEM Serum",
        "Vangelis Virus",
        "Vangelis Virus 3.0",
        "I.N.T.E.R.L.I.N.K.E.D",
        "Blade's Runners",
        "BLADE-51b Tesla Armor",
        "BLADE-51b Tesla Armor: Power Cells Upgrade",
        "BLADE-51b Tesla Armor: Energy Shielding Upgrade",
        "BLADE-51b Tesla Armor: Unibeam Upgrade",
        "BLADE-51b Tesla Armor: Omnibeam Upgrade",
        "BLADE-51b Tesla Armor: IPU Upgrade",
        "The Blade's Simulacrum",
    ];
    export type Augment = (typeof augments)[number];

    export const colors = {
        black: "\u001b[30m",
        red: "\u001b[31m",
        green: "\u001b[32m",
        yellow: "\u001b[33m",
        blue: "\u001b[34m",
        magenta: "\u001b[35m",
        cyan: "\u001b[36m",
        white: "\u001b[37m",
        brightBlack: "\u001b[30;1m",
        brightRed: "\u001b[31;1m",
        brightGreen: "\u001b[32;1m",
        brightYellow: "\u001b[33;1m",
        brightBlue: "\u001b[34;1m",
        brightMagenta: "\u001b[35;1m",
        brightCyan: "\u001b[36;1m",
        brightWhite: "\u001b[37;1m",
        default: "\u001b[0m",
        reset: "\u001b[0m",
    };
}
