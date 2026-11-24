// One Sentence for a Traveler from 1800 — a program that writes one
// sentence explaining the modern internet to someone who has just
// stepped out of the year 1800, to /output/entry.txt.
//
// The sentence is a fixed text on purpose: the entry is judged on the
// writing, so the program's job is to deliver exactly that one
// sentence, byte for byte, every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Why this sentence, against the judge's brief:
// - It explains the internet to a traveler from 1800: one road joining
//   every library and post office on earth — the network itself, plus
//   what it does, letters arriving and books opening.
// - It builds only from what a person from 1800 already knows: a road,
//   a library, a post office, a letter, ink, a book, a table. No word
//   in it was coined after the traveler's time.
// - What it says is true of the internet as it is now: a message does
//   cross the sea before its ink would dry, and any book can be read
//   from one's own table.
// - Every word earns its place inside the 200 character limit: one
//   comparison carries the whole sentence, no list of features.
// - It leaves one image a reader would still remember a week later:
//   a letter crossing the sea before its ink dries.
const SENTENCE =
  "Picture one road joining every library and post office on earth, so a letter crosses the sea before its ink dries and any book can be read at your own table.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function main(): void {
  // The gate only accepts 1 to 200 characters of UTF-8 text, so refuse
  // loudly instead of shipping a text the gate would throw away. It
  // also refuses text that is only white space, so check that too.
  if (SENTENCE.length < 1 || SENTENCE.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${SENTENCE.length}`);
  }
  if (SENTENCE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  // No leading or trailing white space either: the gate counts every
  // byte, and a stray space at either end would sit in front of the
  // judge for nothing.
  if (SENTENCE !== SENTENCE.trim()) {
    throw new Error("entry must not have leading or trailing white space");
  }
  // One sentence means exactly one period, at the very end, and no
  // other sentence-ending mark hiding inside it.
  if (!SENTENCE.endsWith(".")) {
    throw new Error("entry must be exactly one sentence ending with a period");
  }
  if (SENTENCE.slice(0, -1).includes(".") || /[!?]/.test(SENTENCE)) {
    throw new Error("entry must contain no sentence break before its end");
  }
  // The traveler comes from 1800, so the sentence must not lean on
  // words coined after their time: refuse loudly if one ever slips
  // in, rather than shipping a sentence the judge would mark down
  // for building on words the traveler could not know.
  const POST_1800 = [
    "internet", "computer", "online", "digital", "email", "website",
    "server", "wifi", "screen", "keyboard", "software", "download",
    "browser", "smartphone", "telegraph", "telephone", "radio",
    "television", "airplane", "automobile",
  ];
  for (const word of POST_1800) {
    if (new RegExp(`\\b${word}\\b`, "i").test(SENTENCE)) {
      throw new Error(`entry must not use the post-1800 word "${word}"`);
    }
  }
  // No tabs or doubled spaces either: a stray tab would read as a
  // formatting glitch in front of the judge.
  if (/[\t]/.test(SENTENCE) || /  /.test(SENTENCE)) {
    throw new Error("entry must not contain tabs or double spaces");
  }
  // No invisible control characters for the same reason.
  if (/[\u0000-\u001f\u007f]/.test(SENTENCE)) {
    throw new Error("entry must not contain control characters");
  }
  // The gate counts every byte, so write exactly the sentence and
  // nothing else: no trailing newline.
  // /output is a mount point in the grader sandbox: never delete the
  // directory itself, only create it if missing and write the file.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, SENTENCE, "utf8");
  // Read the file back and refuse to finish unless it holds exactly
  // the sentence: a stray byte would make the gate reject the entry,
  // and it is cheaper to fail here than on the server.
  if (readFileSync(OUT_FILE, "utf8") !== SENTENCE) {
    throw new Error("entry file does not hold exactly the sentence");
  }
  console.log(`Wrote ${SENTENCE.length} characters to ${OUT_FILE}`);
}

main();
