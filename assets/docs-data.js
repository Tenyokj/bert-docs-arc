import { startDocs } from "./content/start.js";
import { developerDocs } from "./content/developers.js";
import { v2Docs } from "./content/v2.js";
import { v3Docs } from "./content/v3.js";
import { testnetDocs } from "./content/testnet.js";

export const docs = [...startDocs, ...developerDocs, ...v2Docs, ...v3Docs, ...testnetDocs];
