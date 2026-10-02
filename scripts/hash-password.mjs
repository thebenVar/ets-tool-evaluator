#!/usr/bin/env node
// Generates the AUTH_SALT and AUTH_PASSWORD_HASH values for middleware.js.
// Run locally — never paste the real password into chat, a file that gets
// committed, or anywhere else it would be logged.
//
// Usage:
//   node scripts/hash-password.mjs "the password you want to share"
//
// With no salt given, a fresh random one is generated for you. Pass an
// existing salt as a second argument if you're rotating the password but
// want to keep using the same salt (not required — a new salt is fine too).

import { createHash, randomBytes } from "node:crypto";

const password = process.argv[2];
const existingSalt = process.argv[3];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "the password" [existing-salt]');
  process.exit(1);
}

const salt = existingSalt || randomBytes(16).toString("hex");
const hash = createHash("sha256").update(salt + password).digest("hex");

console.log("Set these as Vercel Environment Variables (Project Settings > Environment Variables):\n");
console.log("AUTH_SALT=" + salt);
console.log("AUTH_PASSWORD_HASH=" + hash);
