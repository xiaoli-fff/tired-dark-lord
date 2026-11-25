// The Tired Dark Lord — emit one ~100-word villain monologue.
//
// The tiredness never gets named: it lives in the rhythm — the villain
// repeating himself to the fourth hero, the rehearsed monologue gone flat,
// the great plan remembered as a letter he no longer recognises. The
// scheme and the history are still there (banners, skulls, mountains),
// but the offer of tea and "the dark can wait its turn" lets the
// exhaustion surface as courtesy instead of complaint.
//
// Design: the entry is a single fixed string. Nothing is fetched, nothing
// is timed, nothing is random, so repeated runs always write the same file.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest caps: the sealed gate allows 1 to 600 characters, and the brief
// asks for a monologue of about 100 words.
const ENTRY_LIMIT = 600;
const WORD_MIN = 90;
const WORD_MAX = 110;

// The entry itself. Kept verbatim: the wording, spacing and final full stop
// are part of the submission and must not be touched.
const ENTRY =
  "You stand before the throne you dreamed of, hero, and I find I have nothing left to say to you that I have not already said to the last four. The banners, the skulls, the monologue \u2014 I had it all rehearsed by candlelight, once. Tonight the candles gutter, the maps curl at the edges, and the great plan, the one I have carried since the mountains were young, feels like a letter I no longer remember writing. Strike, then. Or sit. The tea I poured you is still warm, and the dark, for once, can wait its turn.";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const DEFAULT_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

function countWords(line: string): number {
  return line.trim().split(/\s+/).filter(Boolean).length;
}

function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// Every rule the contest imposes on the entry, checked up front.
function validateEntry(line: string): void {
  const len = countChars(line);
  if (len === 0 || line.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
  const words = countWords(line);
  if (words < WORD_MIN || words > WORD_MAX) {
    throw new Error(
      `entry is ${words} words, outside the ${WORD_MIN}-${WORD_MAX} word range`,
    );
  }
  if (hasBadWhitespace(line)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(line);
  checkNoControlChars(line);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

function emitEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_FILENAME);
  writeFileSync(target, line, "utf8");
  return target;
}

function main(): void {
  validateEntry(ENTRY);
  const target = emitEntry(ENTRY, resolveOutputDir());
  console.log(
    `wrote ${countChars(ENTRY)}-character, ${countWords(ENTRY)}-word entry to ${target}`,
  );
}

main();
