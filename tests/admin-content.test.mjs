import assert from "node:assert/strict";
import test from "node:test";

import { adminContentWorkflows, getAdminWorkflow } from "../scripts/lib/admin-content.mjs";

test("admin content workflows include service providers and local resources", () => {
  assert.deepEqual(adminContentWorkflows.map((workflow) => workflow.id), ["service-provider-profile", "local-resource"]);
});

test("service provider workflow is paywalled and admin approved", () => {
  const workflow = getAdminWorkflow("service-provider-profile");

  assert.equal(workflow.entryMode, "admin-uploaded");
  assert.equal(workflow.paymentModel, "paywall");
  assert.equal(workflow.requiresPayment, true);
  assert.equal(workflow.requiresApproval, true);
  assert.equal(workflow.publicSubmission, false);
});

test("local resource workflow is admin-added data without payment", () => {
  const workflow = getAdminWorkflow("local-resource");

  assert.equal(workflow.entryMode, "admin-added-data");
  assert.equal(workflow.paymentModel, "none");
  assert.equal(workflow.requiresPayment, false);
  assert.equal(workflow.requiresApproval, true);
  assert.equal(workflow.publicSubmission, false);
});
