-- LRPR migration: FSBO immersive listing upgrade flag
-- 2026-05-29
--
-- FSBO listings come in two tiers paid at submission time:
--   standard ($350)  -> classic listing presentation
--   upgraded ($450)  -> immersive (BW black/gold) presentation
-- The choice is captured on the submission and, at publish time, sets the
-- published listing's presentationStyle to "immersive".
--
-- Idempotent — safe to re-run.

alter table submissions
  add column if not exists immersive_upgrade boolean not null default false;
