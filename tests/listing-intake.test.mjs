import assert from "node:assert/strict";
import test from "node:test";

import {
  adminManagedContentTypes,
  listingIntakeSourceTypes,
  listingIntakeStatuses,
  listingSubmissionTypes,
  paymentGateRequirements,
} from "../scripts/lib/listing-intake.mjs";

test("public listing intake is limited to residential sale, land, and rental", () => {
  const typeIds = listingSubmissionTypes.map((type) => type.id);

  assert.deepEqual(typeIds, ["residential-sale", "land-listing", "rental-listing"]);
  assert.equal(listingSubmissionTypes.every((type) => type.requiresAccount), true);
  assert.equal(listingSubmissionTypes.every((type) => type.adminManaged === false), true);
});

test("listing intake supports owner, agent, and property manager source types", () => {
  const sourceIds = listingIntakeSourceTypes.map((source) => source.id);

  assert.deepEqual(sourceIds, ["owner", "agent", "property-manager"]);
});

test("listing intake keeps active and pending choices for MVP submissions", () => {
  const statusIds = listingIntakeStatuses.map((status) => status.id);

  assert.deepEqual(statusIds, ["active", "pending"]);
});

test("service providers and local resources are admin-managed, not public submission types", () => {
  const adminIds = adminManagedContentTypes.map((type) => type.id);
  const publicIds = listingSubmissionTypes.map((type) => type.id);

  assert.deepEqual(adminIds, ["service-provider-profile", "local-resource"]);
  assert.equal(publicIds.includes("service-provider-profile"), false);
  assert.equal(publicIds.includes("local-resource"), false);
  assert.equal(adminManagedContentTypes.find((type) => type.id === "service-provider-profile").requiresPayment, true);
  assert.equal(adminManagedContentTypes.find((type) => type.id === "local-resource").requiresPayment, false);
});

test("publish gates describe account, service-provider paywall, local resources, and admin approval", () => {
  const gateText = paymentGateRequirements.join(" ").toLowerCase();

  assert.match(gateText, /account/);
  assert.match(gateText, /service-provider/);
  assert.match(gateText, /paid|payment|paywall/);
  assert.match(gateText, /local resources/);
  assert.match(gateText, /admin approval/);
  assert.match(gateText, /publishes/);
});
