#!/usr/bin/env node
import { formatEnvReadiness, summarizeEnvReadiness } from "./lib/env-readiness.mjs";

const summary = summarizeEnvReadiness(process.env);
console.log(formatEnvReadiness(summary));

if (!summary.ready) {
  process.exitCode = 1;
}
