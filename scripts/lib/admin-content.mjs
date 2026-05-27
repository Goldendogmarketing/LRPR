export const adminContentWorkflows = [
  {
    id: "service-provider-profile",
    label: "Service provider profile",
    route: "/admin/service-providers",
    entryMode: "admin-uploaded",
    paymentModel: "paywall",
    requiresPayment: true,
    requiresApproval: true,
    publicSubmission: false,
    publishRule: "Only publish after payment/waiver, category fit, contact verification, and admin approval.",
  },
  {
    id: "local-resource",
    label: "Local resource",
    route: "/admin/resources",
    entryMode: "admin-added-data",
    paymentModel: "none",
    requiresPayment: false,
    requiresApproval: true,
    publicSubmission: false,
    publishRule: "Only publish official/local resource records entered or curated by LRPR admin.",
  },
];

export function getAdminWorkflow(id) {
  return adminContentWorkflows.find((workflow) => workflow.id === id) ?? null;
}
