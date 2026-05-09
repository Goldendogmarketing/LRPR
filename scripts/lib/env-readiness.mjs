export const envGroups = [
  {
    id: "supabase",
    label: "Supabase database",
    requiredFor: "Saving submissions and loading the admin queue",
    variables: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  },
  {
    id: "clerk",
    label: "Clerk accounts",
    requiredFor: "Validated accounts and admin route protection",
    variables: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
  },
  {
    id: "stripe",
    label: "Stripe payments",
    requiredFor: "Paid listing/vendor checkout and payment webhooks",
    variables: [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PRICE_STANDARD_LISTING",
      "STRIPE_PRICE_FEATURED_LISTING",
      "STRIPE_PRICE_RENTAL_LISTING",
      "STRIPE_PRICE_VENDOR_PROFILE",
    ],
  },
  {
    id: "resend",
    label: "Resend email",
    requiredFor: "Admin and submitter email notifications",
    variables: ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "ADMIN_NOTIFICATION_EMAIL"],
  },
  {
    id: "maps",
    label: "Google Maps",
    requiredFor: "Interactive maps, geocoding, and address-level enrichment",
    variables: ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "GOOGLE_MAPS_GEOCODING_API_KEY"],
  },
];

export function inspectEnv(env = process.env, groups = envGroups) {
  return groups.map((group) => {
    const variables = group.variables.map((name) => ({
      name,
      present: Boolean(env[name]),
    }));
    const missing = variables.filter((variable) => !variable.present).map((variable) => variable.name);

    return {
      ...group,
      variables,
      ready: missing.length === 0,
      missing,
    };
  });
}

export function summarizeEnvReadiness(env = process.env, groups = envGroups) {
  const inspected = inspectEnv(env, groups);
  const ready = inspected.filter((group) => group.ready);
  const blocked = inspected.filter((group) => !group.ready);

  return {
    total: inspected.length,
    readyCount: ready.length,
    blockedCount: blocked.length,
    ready: blocked.length === 0,
    groups: inspected,
  };
}

export function formatEnvReadiness(summary) {
  const lines = [
    `LRPR integration readiness: ${summary.readyCount}/${summary.total} groups ready`,
    "",
  ];

  summary.groups.forEach((group) => {
    lines.push(`${group.ready ? "✓" : "○"} ${group.label} — ${group.requiredFor}`);
    if (!group.ready) lines.push(`  missing: ${group.missing.join(", ")}`);
  });

  return lines.join("\n");
}
