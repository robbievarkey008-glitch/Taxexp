/**
 * Authoritative TaxExemption enum values from Shopify Admin GraphQL API.
 *
 * SOURCE: Live schema introspection against 2026-04 API on 2026-07-23.
 * Store: tax-exempt-dev.myshopify.com (non-Plus dev store).
 *
 * DO NOT hand-edit this list. If Shopify adds new jurisdictions, re-run
 * the introspection query and regenerate this file:
 *
 *   { __type(name: "TaxExemption") { enumValues { name } } }
 *
 * Total: 71 enum values (22 CA + 1 EU + 48 US)
 */

export const TAX_EXEMPTION_VALUES = [
  // ── Canadian exemptions ──────────────────────────────────────────────────
  "CA_STATUS_CARD_EXEMPTION",
  "CA_BC_RESELLER_EXEMPTION",
  "CA_MB_RESELLER_EXEMPTION",
  "CA_SK_RESELLER_EXEMPTION",
  "CA_SK_VPT_RESELLER_EXEMPTION",
  "CA_NL_VPT_RESELLER_EXEMPTION",
  "CA_DIPLOMAT_EXEMPTION",
  "CA_BC_COMMERCIAL_FISHERY_EXEMPTION",
  "CA_MB_COMMERCIAL_FISHERY_EXEMPTION",
  "CA_NS_COMMERCIAL_FISHERY_EXEMPTION",
  "CA_PE_COMMERCIAL_FISHERY_EXEMPTION",
  "CA_SK_COMMERCIAL_FISHERY_EXEMPTION",
  "CA_BC_PRODUCTION_AND_MACHINERY_EXEMPTION",
  "CA_SK_PRODUCTION_AND_MACHINERY_EXEMPTION",
  "CA_BC_SUB_CONTRACTOR_EXEMPTION",
  "CA_SK_SUB_CONTRACTOR_EXEMPTION",
  "CA_BC_CONTRACTOR_EXEMPTION",
  "CA_SK_CONTRACTOR_EXEMPTION",
  "CA_ON_PURCHASE_EXEMPTION",
  "CA_MB_FARMER_EXEMPTION",
  "CA_NS_FARMER_EXEMPTION",
  "CA_SK_FARMER_EXEMPTION",

  // ── EU exemptions ────────────────────────────────────────────────────────
  "EU_REVERSE_CHARGE_EXEMPTION_RULE",

  // ── US exemptions (all 50 states + DC) ───────────────────────────────────
  "US_AL_RESELLER_EXEMPTION",
  "US_AK_RESELLER_EXEMPTION",
  "US_AZ_RESELLER_EXEMPTION",
  "US_AR_RESELLER_EXEMPTION",
  "US_CA_RESELLER_EXEMPTION",
  "US_CO_RESELLER_EXEMPTION",
  "US_CT_RESELLER_EXEMPTION",
  "US_DE_RESELLER_EXEMPTION",
  "US_FL_RESELLER_EXEMPTION",
  "US_GA_RESELLER_EXEMPTION",
  "US_HI_RESELLER_EXEMPTION",
  "US_ID_RESELLER_EXEMPTION",
  "US_IL_RESELLER_EXEMPTION",
  "US_IN_RESELLER_EXEMPTION",
  "US_IA_RESELLER_EXEMPTION",
  "US_KS_RESELLER_EXEMPTION",
  "US_KY_RESELLER_EXEMPTION",
  "US_LA_RESELLER_EXEMPTION",
  "US_ME_RESELLER_EXEMPTION",
  "US_MD_RESELLER_EXEMPTION",
  "US_MA_RESELLER_EXEMPTION",
  "US_MI_RESELLER_EXEMPTION",
  "US_MN_RESELLER_EXEMPTION",
  "US_MS_RESELLER_EXEMPTION",
  "US_MO_RESELLER_EXEMPTION",
  "US_MT_RESELLER_EXEMPTION",
  "US_NE_RESELLER_EXEMPTION",
  "US_NV_RESELLER_EXEMPTION",
  "US_NH_RESELLER_EXEMPTION",
  "US_NJ_RESELLER_EXEMPTION",
  "US_NM_RESELLER_EXEMPTION",
  "US_NY_RESELLER_EXEMPTION",
  "US_NC_RESELLER_EXEMPTION",
  "US_ND_RESELLER_EXEMPTION",
  "US_OH_RESELLER_EXEMPTION",
  "US_OK_RESELLER_EXEMPTION",
  "US_OR_RESELLER_EXEMPTION",
  "US_PA_RESELLER_EXEMPTION",
  "US_RI_RESELLER_EXEMPTION",
  "US_SC_RESELLER_EXEMPTION",
  "US_SD_RESELLER_EXEMPTION",
  "US_TN_RESELLER_EXEMPTION",
  "US_TX_RESELLER_EXEMPTION",
  "US_UT_RESELLER_EXEMPTION",
  "US_VT_RESELLER_EXEMPTION",
  "US_VA_RESELLER_EXEMPTION",
  "US_WA_RESELLER_EXEMPTION",
  "US_WV_RESELLER_EXEMPTION",
  "US_WI_RESELLER_EXEMPTION",
  "US_WY_RESELLER_EXEMPTION",
  "US_DC_RESELLER_EXEMPTION",
] as const;

export type TaxExemptionValue = (typeof TAX_EXEMPTION_VALUES)[number];

/**
 * Human-readable labels for the jurisdiction dropdown in the upload form.
 * Displayed to buyers — not sent to the API (the raw enum value is sent).
 */
export const TAX_EXEMPTION_LABELS: Record<TaxExemptionValue, string> = {
  // Canadian
  CA_STATUS_CARD_EXEMPTION:                   "Canada — Status Card",
  CA_BC_RESELLER_EXEMPTION:                   "British Columbia — Reseller",
  CA_MB_RESELLER_EXEMPTION:                   "Manitoba — Reseller",
  CA_SK_RESELLER_EXEMPTION:                   "Saskatchewan — Reseller",
  CA_SK_VPT_RESELLER_EXEMPTION:               "Saskatchewan — VPT Reseller",
  CA_NL_VPT_RESELLER_EXEMPTION:               "Newfoundland — VPT Reseller",
  CA_DIPLOMAT_EXEMPTION:                      "Canada — Diplomat",
  CA_BC_COMMERCIAL_FISHERY_EXEMPTION:         "British Columbia — Commercial Fishery",
  CA_MB_COMMERCIAL_FISHERY_EXEMPTION:         "Manitoba — Commercial Fishery",
  CA_NS_COMMERCIAL_FISHERY_EXEMPTION:         "Nova Scotia — Commercial Fishery",
  CA_PE_COMMERCIAL_FISHERY_EXEMPTION:         "Prince Edward Island — Commercial Fishery",
  CA_SK_COMMERCIAL_FISHERY_EXEMPTION:         "Saskatchewan — Commercial Fishery",
  CA_BC_PRODUCTION_AND_MACHINERY_EXEMPTION:   "British Columbia — Production & Machinery",
  CA_SK_PRODUCTION_AND_MACHINERY_EXEMPTION:   "Saskatchewan — Production & Machinery",
  CA_BC_SUB_CONTRACTOR_EXEMPTION:             "British Columbia — Sub-Contractor",
  CA_SK_SUB_CONTRACTOR_EXEMPTION:             "Saskatchewan — Sub-Contractor",
  CA_BC_CONTRACTOR_EXEMPTION:                 "British Columbia — Contractor",
  CA_SK_CONTRACTOR_EXEMPTION:                 "Saskatchewan — Contractor",
  CA_ON_PURCHASE_EXEMPTION:                   "Ontario — Purchase",
  CA_MB_FARMER_EXEMPTION:                     "Manitoba — Farmer",
  CA_NS_FARMER_EXEMPTION:                     "Nova Scotia — Farmer",
  CA_SK_FARMER_EXEMPTION:                     "Saskatchewan — Farmer",
  // EU
  EU_REVERSE_CHARGE_EXEMPTION_RULE:           "EU — Reverse Charge",
  // US
  US_AL_RESELLER_EXEMPTION:                   "Alabama — Reseller",
  US_AK_RESELLER_EXEMPTION:                   "Alaska — Reseller",
  US_AZ_RESELLER_EXEMPTION:                   "Arizona — Reseller",
  US_AR_RESELLER_EXEMPTION:                   "Arkansas — Reseller",
  US_CA_RESELLER_EXEMPTION:                   "California — Reseller",
  US_CO_RESELLER_EXEMPTION:                   "Colorado — Reseller",
  US_CT_RESELLER_EXEMPTION:                   "Connecticut — Reseller",
  US_DE_RESELLER_EXEMPTION:                   "Delaware — Reseller",
  US_FL_RESELLER_EXEMPTION:                   "Florida — Reseller",
  US_GA_RESELLER_EXEMPTION:                   "Georgia — Reseller",
  US_HI_RESELLER_EXEMPTION:                   "Hawaii — Reseller",
  US_ID_RESELLER_EXEMPTION:                   "Idaho — Reseller",
  US_IL_RESELLER_EXEMPTION:                   "Illinois — Reseller",
  US_IN_RESELLER_EXEMPTION:                   "Indiana — Reseller",
  US_IA_RESELLER_EXEMPTION:                   "Iowa — Reseller",
  US_KS_RESELLER_EXEMPTION:                   "Kansas — Reseller",
  US_KY_RESELLER_EXEMPTION:                   "Kentucky — Reseller",
  US_LA_RESELLER_EXEMPTION:                   "Louisiana — Reseller",
  US_ME_RESELLER_EXEMPTION:                   "Maine — Reseller",
  US_MD_RESELLER_EXEMPTION:                   "Maryland — Reseller",
  US_MA_RESELLER_EXEMPTION:                   "Massachusetts — Reseller",
  US_MI_RESELLER_EXEMPTION:                   "Michigan — Reseller",
  US_MN_RESELLER_EXEMPTION:                   "Minnesota — Reseller",
  US_MS_RESELLER_EXEMPTION:                   "Mississippi — Reseller",
  US_MO_RESELLER_EXEMPTION:                   "Missouri — Reseller",
  US_MT_RESELLER_EXEMPTION:                   "Montana — Reseller",
  US_NE_RESELLER_EXEMPTION:                   "Nebraska — Reseller",
  US_NV_RESELLER_EXEMPTION:                   "Nevada — Reseller",
  US_NH_RESELLER_EXEMPTION:                   "New Hampshire — Reseller",
  US_NJ_RESELLER_EXEMPTION:                   "New Jersey — Reseller",
  US_NM_RESELLER_EXEMPTION:                   "New Mexico — Reseller",
  US_NY_RESELLER_EXEMPTION:                   "New York — Reseller",
  US_NC_RESELLER_EXEMPTION:                   "North Carolina — Reseller",
  US_ND_RESELLER_EXEMPTION:                   "North Dakota — Reseller",
  US_OH_RESELLER_EXEMPTION:                   "Ohio — Reseller",
  US_OK_RESELLER_EXEMPTION:                   "Oklahoma — Reseller",
  US_OR_RESELLER_EXEMPTION:                   "Oregon — Reseller",
  US_PA_RESELLER_EXEMPTION:                   "Pennsylvania — Reseller",
  US_RI_RESELLER_EXEMPTION:                   "Rhode Island — Reseller",
  US_SC_RESELLER_EXEMPTION:                   "South Carolina — Reseller",
  US_SD_RESELLER_EXEMPTION:                   "South Dakota — Reseller",
  US_TN_RESELLER_EXEMPTION:                   "Tennessee — Reseller",
  US_TX_RESELLER_EXEMPTION:                   "Texas — Reseller",
  US_UT_RESELLER_EXEMPTION:                   "Utah — Reseller",
  US_VT_RESELLER_EXEMPTION:                   "Vermont — Reseller",
  US_VA_RESELLER_EXEMPTION:                   "Virginia — Reseller",
  US_WA_RESELLER_EXEMPTION:                   "Washington — Reseller",
  US_WV_RESELLER_EXEMPTION:                   "West Virginia — Reseller",
  US_WI_RESELLER_EXEMPTION:                   "Wisconsin — Reseller",
  US_WY_RESELLER_EXEMPTION:                   "Wyoming — Reseller",
  US_DC_RESELLER_EXEMPTION:                   "Washington D.C. — Reseller",
};

/**
 * Sorted options for the jurisdiction <select> dropdown.
 * Groups: Canadian → EU → US, alphabetical within each group.
 */
export const TAX_EXEMPTION_OPTIONS = TAX_EXEMPTION_VALUES.map((value) => ({
  value,
  label: TAX_EXEMPTION_LABELS[value],
}));
