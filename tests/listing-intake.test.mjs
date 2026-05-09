import assert from "node:assert/strict";
import test from "node:test";

import {
  getListingIntakeChecklist,
  listingIntakeSourceTypes,
  listingIntakeStatuses,
} from "../scripts/lib/listing-intake.mjs";

test("listing intake supports owner, agent, manager, and LRPR verified source types", () => {
  const sourceIds = listingIntakeSourceTypes.map((source) => source.id);

  assert.deepEqual(sourceIds, ["owner", "agent", "property-manager", "lrpr-verified"]);
});

test("listing intake keeps active, pending, sold, and archived status choices", () => {
  const statusIds = listingIntakeStatuses.map((status) => status.id);

  assert.deepEqual(statusIds, ["active", "pending", "sold", "archived"]);
});

test("listing intake checklist requires proof, permission, address, and public-data review", () => {
  const checklist = getListingIntakeChecklist();
  const checklistText = checklist.join(" ").toLowerCase();

  assert.equal(checklist.length >= 5, true);
  assert.match(checklistText, /permission/);
  assert.match(checklistText, /address/);
  assert.match(checklistText, /photo/);
  assert.match(checklistText, /flood/);
  assert.match(checklistText, /parcel/);
});
