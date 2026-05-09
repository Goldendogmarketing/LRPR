import assert from "node:assert/strict";
import test from "node:test";

import { envGroups, formatEnvReadiness, inspectEnv, summarizeEnvReadiness } from "../scripts/lib/env-readiness.mjs";

test("envGroups tracks Supabase, Clerk, Stripe, Resend, and Maps", () => {
  const ids = envGroups.map((group) => group.id);

  assert.deepEqual(ids, ["supabase", "clerk", "stripe", "resend", "maps"]);
});

test("inspectEnv reports missing variables per group", () => {
  const result = inspectEnv({ NEXT_PUBLIC_SUPABASE_URL: "url" }, [envGroups[0]]);

  assert.equal(result[0].ready, false);
  assert.deepEqual(result[0].missing, ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);
});

test("summarizeEnvReadiness reports full readiness when every key is present", () => {
  const fakeEnv = Object.fromEntries(envGroups.flatMap((group) => group.variables.map((name) => [name, "set"])));
  const summary = summarizeEnvReadiness(fakeEnv);

  assert.equal(summary.ready, true);
  assert.equal(summary.readyCount, envGroups.length);
  assert.equal(summary.blockedCount, 0);
});

test("formatEnvReadiness lists missing keys without exposing values", () => {
  const summary = summarizeEnvReadiness({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_sensitive" }, [envGroups[1]]);
  const output = formatEnvReadiness(summary);

  assert.match(output, /CLERK_SECRET_KEY/);
  assert.doesNotMatch(output, /pk_test_sensitive/);
});
