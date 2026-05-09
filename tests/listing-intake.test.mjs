import assert from "node:assert/strict";
import test from "node:test";

import {
  listingIntakeSourceTypes,
  listingIntakeStatuses,
  listingSubmissionTypes,
  paymentGateRequirements,
} from "../scripts/lib/listing-intake.mjs";

test("listing intake supports owner, agent, manager, and LRPR verified source types", () => {
  const sourceIds = listingIntakeSourceTypes.map((source) => source.id);

  assert.deepEqual(sourceIds, ["owner", "agent", "property-manager", "lrpr-verified"]);
});

test("listing intake keeps active, pending, sold, and archived status choices", () => {
  const statusIds = listingIntakeStatuses.map((status) => status.id);

  assert.deepEqual(statusIds, ["active", "pending", "sold", "archived"]);
});

test("submission types include free draft, standard listing, featured listing, rental, sold archive, and vendor request", () => {
  const typeIds = listingSubmissionTypes.map((type) => type.id);

  assert.deepEqual(typeIds, [
    "free-draft-review",
    "standard-sale-listing",
    "featured-sale-listing",
    "rental-listing",
    "sold-archive-record",
    "vendor-service-pro",
  ]);
  assert.equal(listingSubmissionTypes.every((type) => typeof type.requiresAccount === "boolean"), true);
  assert.equal(listingSubmissionTypes.filter((type) => type.requiresPayment).length >= 4, true);
});

test("payment gate requires validated account, payment, and admin approval before publish", () => {
  const gateText = paymentGateRequirements.join(" ").toLowerCase();

  assert.match(gateText, /account/);
  assert.match(gateText, /email/);
  assert.match(gateText, /payment/);
  assert.match(gateText, /admin approval/);
  assert.match(gateText, /publish/);
});
