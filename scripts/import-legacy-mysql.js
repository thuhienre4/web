const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const defaultOutput = path.join(root, "data", "legacy-cms.json");
const supportedTables = [
  "categories",
  "deals",
  "discounts",
  "feedbacks",
  "menus",
  "offers",
  "pages",
  "posts",
  "settings",
  "slugs",
  "stores",
  "widgets",
];

function usage() {
  console.log([
    "Import a legacy TeelaCodes MariaDB dump without replacing current website data.",
    "",
    "Usage:",
    "  node scripts/import-legacy-mysql.js <dump.sql|dump.sql.gz> [--output <file>] [--check]",
    "",
    "The generated legacy-cms.json is an isolated snapshot. Existing offers, settings,",
    "admin users, subscribers, and website assets are never modified.",
  ].join("\n"));
}

function parseArguments(argv) {
  const args = { input: "", output: defaultOutput, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--help" || value === "-h") return { help: true };
    if (value === "--check") {
      args.check = true;
      continue;
    }
    if (value === "--output") {
      args.output = path.resolve(argv[index + 1] || "");
      index += 1;
      continue;
    }
    if (!value.startsWith("-") && !args.input) args.input = path.resolve(value);
  }
  return args;
}

function readDump(filePath) {
  const bytes = fs.readFileSync(filePath);
  return (filePath.toLowerCase().endsWith(".gz") ? zlib.gunzipSync(bytes) : bytes).toString("utf8");
}

function extractCreateBlocks(sql) {
  const schemas = {};
  const expression = /CREATE TABLE `([^`]+)`\s*\(([\s\S]*?)\) ENGINE=/g;
  for (const match of sql.matchAll(expression)) {
    const table = match[1];
    const columns = [];
    for (const line of match[2].split(/\r?\n/)) {
      const column = line.match(/^\s*`([^`]+)`\s+(.+?)(?:,)?\s*$/);
      if (!column) continue;
      const definition = column[2].replace(/,$/, "");
      columns.push({
        name: column[1],
        type: definition.match(/^([^\s]+(?:\s+unsigned)?)/i)?.[1] || definition,
        nullable: !/\bNOT NULL\b/i.test(definition),
        default: definition.match(/\bDEFAULT\s+((?:'[^']*')|(?:[^\s,]+))/i)?.[1] ?? null,
      });
    }
    schemas[table] = { columns };
  }
  return schemas;
}

function findInsertPayloads(sql, table) {
  const marker = `INSERT INTO \`${table}\` VALUES`;
  const payloads = [];
  let cursor = 0;
  while ((cursor = sql.indexOf(marker, cursor)) !== -1) {
    const start = cursor + marker.length;
    let quote = false;
    let escaped = false;
    let end = start;
    for (; end < sql.length; end += 1) {
      const character = sql[end];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\" && quote) {
        escaped = true;
        continue;
      }
      if (character === "'") quote = !quote;
      if (character === ";" && !quote) break;
    }
    if (end >= sql.length) throw new Error(`Unterminated INSERT statement for ${table}.`);
    payloads.push(sql.slice(start, end).trim());
    cursor = end + 1;
  }
  return payloads;
}

function decodeMysqlString(value) {
  const replacements = { "0": "\0", b: "\b", n: "\n", r: "\r", t: "\t", Z: "\x1a" };
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "\\" || index === value.length - 1) {
      output += value[index];
      continue;
    }
    const next = value[index + 1];
    output += Object.prototype.hasOwnProperty.call(replacements, next) ? replacements[next] : next;
    index += 1;
  }
  return output;
}

function convertValue(token, quoted) {
  if (quoted) return decodeMysqlString(token);
  const value = token.trim();
  if (/^NULL$/i.test(value)) return null;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) return Number(value);
  return value;
}

function parseTuples(payload) {
  const rows = [];
  let tuple = null;
  let token = "";
  let quoted = false;
  let tokenWasQuoted = false;
  let escaped = false;
  const finishValue = () => {
    tuple.push(convertValue(token, tokenWasQuoted));
    token = "";
    tokenWasQuoted = false;
  };

  for (let index = 0; index < payload.length; index += 1) {
    const character = payload[index];
    if (tuple === null) {
      if (character === "(") tuple = [];
      continue;
    }
    if (escaped) {
      token += `\\${character}`;
      escaped = false;
      continue;
    }
    if (quoted && character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "'") {
      quoted = !quoted;
      tokenWasQuoted = true;
      continue;
    }
    if (!quoted && character === ",") {
      finishValue();
      continue;
    }
    if (!quoted && character === ")") {
      finishValue();
      rows.push(tuple);
      tuple = null;
      continue;
    }
    token += character;
  }
  if (tuple !== null || quoted || escaped) throw new Error("Malformed VALUES tuple in SQL dump.");
  return rows;
}

function importDump(sql, sourceName) {
  const allSchemas = extractCreateBlocks(sql);
  const tables = {};
  for (const table of supportedTables) {
    const schema = allSchemas[table];
    if (!schema) continue;
    const values = findInsertPayloads(sql, table).flatMap(parseTuples);
    const records = values.map((row, rowIndex) => {
      if (row.length !== schema.columns.length) {
        throw new Error(`${table} row ${rowIndex + 1} has ${row.length} values; expected ${schema.columns.length}.`);
      }
      return Object.fromEntries(schema.columns.map((column, columnIndex) => [column.name, row[columnIndex]]));
    });
    tables[table] = { schema, records };
  }
  return {
    format: "alocoupon-legacy-cms",
    version: 1,
    source: path.basename(sourceName),
    tables,
  };
}

function validateSnapshot(snapshot) {
  if (snapshot.format !== "alocoupon-legacy-cms" || snapshot.version !== 1) throw new Error("Unsupported snapshot format.");
  for (const [table, value] of Object.entries(snapshot.tables || {})) {
    if (!supportedTables.includes(table)) throw new Error(`Unexpected table: ${table}.`);
    if (!Array.isArray(value?.schema?.columns) || !Array.isArray(value?.records)) throw new Error(`Invalid table data: ${table}.`);
  }
}

function printSummary(snapshot) {
  console.log(`Source: ${snapshot.source}`);
  for (const [table, value] of Object.entries(snapshot.tables)) {
    console.log(`${table.padEnd(12)} ${String(value.records.length).padStart(5)} records / ${value.schema.columns.length} columns`);
  }
}

function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args.help) return usage();
  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(args.input)) throw new Error(`Dump file not found: ${args.input}`);
  const snapshot = importDump(readDump(args.input), args.input);
  validateSnapshot(snapshot);
  printSummary(snapshot);
  if (args.check) {
    console.log("Check completed; no files were written.");
    return;
  }
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Imported snapshot: ${args.output}`);
  console.log("Current website data was not modified.");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Import failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { importDump, parseTuples, validateSnapshot };
