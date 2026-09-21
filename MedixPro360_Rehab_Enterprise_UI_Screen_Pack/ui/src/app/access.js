export const WORKSPACES = {
  PLATFORM_OPERATIONS: 'PLATFORM_OPERATIONS',
  TENANT_ADMINISTRATION: 'TENANT_ADMINISTRATION',
  CENTRE_OPERATIONS: 'CENTRE_OPERATIONS',
  CLINICIAN_WORKSPACE: 'CLINICIAN_WORKSPACE',
  NURSING_WORKSPACE: 'NURSING_WORKSPACE',
  RESIDENTIAL_WORKSPACE: 'RESIDENTIAL_WORKSPACE',
  HOME_CARE_OPERATIONS: 'HOME_CARE_OPERATIONS',
  BILLING_OPERATIONS: 'BILLING_OPERATIONS',
  INVENTORY_OPERATIONS: 'INVENTORY_OPERATIONS',
  COMPLIANCE_OPERATIONS: 'COMPLIANCE_OPERATIONS'
};

const basePermissions = ['workspace.view', 'tasks.view', 'notifications.view', 'search.view'];
export const PERMISSIONS = {
  CLIENTS_VIEW: 'clients.view', CLINICAL_VIEW: 'clinical.view', CLINICAL_EDIT: 'clinical.edit', CLINICAL_REVIEW: 'clinical.review', CLINICAL_SIGN: 'clinical.sign',
  RISK_VIEW: 'risk.view', RISK_MANAGE: 'risk.manage', CARE_TEAM_VIEW: 'care-team.view', CARE_TEAM_MANAGE: 'care-team.manage',
  TREATMENT_VIEW: 'treatment-plan.view', TREATMENT_EDIT: 'treatment-plan.edit', TREATMENT_APPROVE: 'treatment-plan.approve',
  MDT_VIEW: 'mdt.view', MDT_PARTICIPATE: 'mdt.participate', MDT_FINALIZE: 'mdt.finalize', THERAPY_SCHEDULE: 'therapy.schedule.view', THERAPY_VIEW: 'therapy.view', THERAPY_DOCUMENT: 'therapy.document', THERAPY_REVIEW: 'therapy.review', THERAPY_SIGN: 'therapy.sign', STANDARDIZED_VIEW: 'standardized-assessment.view', STANDARDIZED_COMPLETE: 'standardized-assessment.complete', STANDARDIZED_FINALIZE: 'standardized-assessment.finalize'
  , NURSING_VIEW: 'nursing.view', NURSING_DOCUMENT: 'nursing.document', NURSING_REVIEW: 'nursing.review', OBSERVATIONS_VIEW: 'observations.view', OBSERVATIONS_RECORD: 'observations.record', OBSERVATIONS_CORRECT: 'observations.correct', MEDICATION_VIEW: 'medication.view', MEDICATION_ORDER: 'medication.order', MEDICATION_REVIEW: 'medication.review', MEDICATION_DISCONTINUE: 'medication.discontinue', MAR_VIEW: 'mar.view', MAR_ADMINISTER: 'mar.administer', MAR_CORRECT: 'mar.correct', PRN_VIEW: 'prn.view', PRN_ADMINISTER: 'prn.administer', PRN_EFFECTIVENESS: 'prn.effectiveness.record', RESIDENTIAL_VIEW: 'residential.view', RESIDENTIAL_DOCUMENT: 'residential.document', RESIDENTIAL_REVIEW: 'residential.review', HANDOVER_VIEW: 'handover.view', HANDOVER_CREATE: 'handover.create', HANDOVER_FINALIZE: 'handover.finalize', FACILITY_VIEW: 'facility.view', FACILITY_MANAGE: 'facility.manage', BED_VIEW: 'bed.view', BED_ASSIGN: 'bed.assign', BED_TRANSFER: 'bed.transfer', BED_LEAVE: 'bed.leave', BED_RELEASE: 'bed.release', INCIDENT_VIEW: 'incident.view', INCIDENT_CREATE: 'incident.create', INCIDENT_REVIEW: 'incident.review', HOMECARE_VIEW: 'home-care.view', HOMECARE_ENROLL: 'home-care.enroll', HOMECARE_PLAN_MANAGE: 'home-care.plan.manage', HOMECARE_VISIT_SCHEDULE: 'home-care.visit.schedule', HOMECARE_VISIT_START: 'home-care.visit.start', HOMECARE_VISIT_DOCUMENT: 'home-care.visit.document', HOMECARE_VISIT_COMPLETE: 'home-care.visit.complete', HOMECARE_VISIT_CANCEL: 'home-care.visit.cancel', HOMECARE_VISIT_MISS: 'home-care.visit.miss', HOMECARE_FOLLOWUP: 'home-care.follow-up.manage', HOMECARE_ESCALATE: 'home-care.escalate', NUTRITION_VIEW: 'nutrition.view', NUTRITION_ASSESS: 'nutrition.assess', NUTRITION_PLAN_MANAGE: 'nutrition.plan.manage', FAMILY_VIEW: 'family.view', FAMILY_MANAGE: 'family.manage', FAMILY_SESSION_DOCUMENT: 'family.session.document', TELEHEALTH_VIEW: 'telehealth.view', TELEHEALTH_SCHEDULE: 'telehealth.schedule', TELEHEALTH_SESSION_MANAGE: 'telehealth.session.manage', DISCHARGE_VIEW: 'discharge.view', DISCHARGE_PLAN_MANAGE: 'discharge.plan.manage', DISCHARGE_REVIEW: 'discharge.review', DISCHARGE_FINALIZE: 'discharge.finalize', AFTERCARE_VIEW: 'aftercare.view', AFTERCARE_PLAN_MANAGE: 'aftercare.plan.manage', AFTERCARE_FOLLOWUP_DOCUMENT: 'aftercare.followup.document', BILLING_VIEW: 'billing.view', BILLING_CHARGE_CREATE: 'billing.charge.create', BILLING_INVOICE_CREATE: 'billing.invoice.create', BILLING_INVOICE_FINALIZE: 'billing.invoice.finalize', BILLING_PAYMENT_RECORD: 'billing.payment.record', BILLING_ADJUSTMENT_CREATE: 'billing.adjustment.create', BILLING_INVOICE_VOID: 'billing.invoice.void', INVENTORY_VIEW: 'inventory.view', INVENTORY_ITEM_MANAGE: 'inventory.item.manage', INVENTORY_RECEIVE: 'inventory.receive', INVENTORY_ISSUE: 'inventory.issue', INVENTORY_REQUEST: 'inventory.request', INVENTORY_TRANSFER_APPROVE: 'inventory.transfer.approve', INVENTORY_TRANSFER_ISSUE: 'inventory.transfer.issue', INVENTORY_TRANSFER_RECEIVE: 'inventory.transfer.receive', INVENTORY_ADJUST: 'inventory.adjust', DOCUMENTS_VIEW: 'documents.view', DOCUMENTS_UPLOAD: 'documents.upload', DOCUMENTS_VERSION_CREATE: 'documents.version.create', CONSENT_VIEW: 'consent.view', CONSENT_CAPTURE: 'consent.capture', CONSENT_REVOKE: 'consent.revoke', COMPLIANCE_VIEW: 'compliance.view', COMPLIANCE_MANAGE: 'compliance.manage', AUDIT_VIEW: 'audit.view', AUDIT_SENSITIVE_VIEW: 'audit.sensitive.view', ANALYTICS_VIEW: 'analytics.view', ANALYTICS_FINANCIAL_VIEW: 'analytics.financial.view', ANALYTICS_INVENTORY_VIEW: 'analytics.inventory.view', REPORTS_EXPORT: 'reports.export', AI_USE: 'ai.use', AI_SUMMARY: 'ai.summary.generate', AI_DRAFT: 'ai.draft.generate', AI_REVIEW: 'ai.recommendation.review', AI_APPLY: 'ai.recommendation.apply', AI_HISTORY: 'ai.history.view'
    , CONFIGURATION_VIEW: 'configuration.view', FACILITY_CONFIGURE: 'facility.configure', ROOM_MANAGE: 'room.manage', BED_CONFIGURE: 'bed.configure', PROGRAMME_MANAGE: 'programme.manage', SERVICE_MANAGE: 'billing.service.manage', PAYER_MANAGE: 'billing.payer.manage', TARIFF_MANAGE: 'billing.tariff.manage'
    , PLATFORM_TENANTS_VIEW: 'platform.tenants.view', PLATFORM_SUBSCRIPTION_VIEW: 'platform.subscription.view', PLATFORM_SUBSCRIPTION_MANAGE: 'platform.subscription.manage', PLATFORM_PLAN_MANAGE: 'platform.plan.manage', PLATFORM_PRICE_MANAGE: 'platform.price.manage', PLATFORM_DISCOUNT_MANAGE: 'platform.discount.manage', PLATFORM_PAYMENT_VIEW: 'platform.payment.view', PLATFORM_CAPACITY_POLICY_VIEW: 'platform.subscription.capacityPolicy.view', PLATFORM_CAPACITY_POLICY_MANAGE: 'platform.subscription.capacityPolicy.manage', TENANT_SUBSCRIPTION_VIEW: 'tenant.subscription.view', TENANT_SUBSCRIPTION_CHECKOUT: 'tenant.subscription.checkout', TENANT_FACILITY_VIEW: 'tenant.facility.view', TENANT_FACILITY_CREATE: 'tenant.facility.create', TENANT_PAYMENT_VIEW: 'tenant.payment.view'
};

export const demoProfiles = {
  platform: {
    id: 'platform-admin', label: 'Platform Super Admin', workspace: WORKSPACES.PLATFORM_OPERATIONS,
    tenant: 'MedixPro360 Platform', location: 'All regions', modules: ['platform', 'ai-governance', 'security', 'audit'],
    permissions: [...basePermissions, 'platform.manage', 'tenant.support', 'audit.view', 'ai.governance', PERMISSIONS.PLATFORM_TENANTS_VIEW, PERMISSIONS.PLATFORM_SUBSCRIPTION_VIEW, PERMISSIONS.PLATFORM_SUBSCRIPTION_MANAGE, PERMISSIONS.PLATFORM_PLAN_MANAGE, PERMISSIONS.PLATFORM_PRICE_MANAGE, PERMISSIONS.PLATFORM_DISCOUNT_MANAGE, PERMISSIONS.PLATFORM_PAYMENT_VIEW, PERMISSIONS.PLATFORM_CAPACITY_POLICY_VIEW, PERMISSIONS.PLATFORM_CAPACITY_POLICY_MANAGE]
  },
  tenant: {
    id: 'tenant-admin', label: 'Tenant Administrator', workspace: WORKSPACES.TENANT_ADMINISTRATION,
      tenant: 'Veda Wellness', location: 'All centres', modules: ['administration', 'configuration', 'home-care', 'audit', 'documents', 'consent', 'compliance', 'analytics', 'reports'],
      permissions: [...basePermissions, 'tenant.manage', 'users.manage', 'locations.manage', PERMISSIONS.CONFIGURATION_VIEW, PERMISSIONS.FACILITY_CONFIGURE, PERMISSIONS.ROOM_MANAGE, PERMISSIONS.BED_CONFIGURE, PERMISSIONS.PROGRAMME_MANAGE, PERMISSIONS.SERVICE_MANAGE, PERMISSIONS.PAYER_MANAGE, PERMISSIONS.TARIFF_MANAGE, PERMISSIONS.INVENTORY_ITEM_MANAGE, PERMISSIONS.AUDIT_VIEW, PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD, PERMISSIONS.DOCUMENTS_VERSION_CREATE, PERMISSIONS.CONSENT_VIEW, PERMISSIONS.CONSENT_CAPTURE, PERMISSIONS.CONSENT_REVOKE, PERMISSIONS.COMPLIANCE_VIEW, PERMISSIONS.COMPLIANCE_MANAGE, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_EXPORT, PERMISSIONS.HOMECARE_VIEW]
  },
  centre: {
    id: 'centre-admin', label: 'Centre Administrator', workspace: WORKSPACES.CENTRE_OPERATIONS,
      tenant: 'Veda Wellness', location: 'Greater Noida Centre', modules: ['operations', 'admissions', 'residential', 'facility', 'configuration', 'home-care', 'discharge', 'aftercare'],
      permissions: [...basePermissions, 'operations.manage', 'admissions.view', 'admissions.manage', 'referrals.view', 'clients.view', 'discharges.view', PERMISSIONS.CONFIGURATION_VIEW, PERMISSIONS.FACILITY_CONFIGURE, PERMISSIONS.ROOM_MANAGE, PERMISSIONS.BED_CONFIGURE, PERMISSIONS.PROGRAMME_MANAGE, PERMISSIONS.SERVICE_MANAGE, PERMISSIONS.PAYER_MANAGE, PERMISSIONS.TARIFF_MANAGE, PERMISSIONS.INVENTORY_ITEM_MANAGE, PERMISSIONS.HOMECARE_VIEW, PERMISSIONS.HOMECARE_ENROLL, PERMISSIONS.HOMECARE_PLAN_MANAGE, PERMISSIONS.HOMECARE_VISIT_SCHEDULE, PERMISSIONS.HOMECARE_VISIT_START, PERMISSIONS.HOMECARE_VISIT_DOCUMENT, PERMISSIONS.HOMECARE_VISIT_COMPLETE, PERMISSIONS.HOMECARE_VISIT_CANCEL, PERMISSIONS.HOMECARE_VISIT_MISS, PERMISSIONS.HOMECARE_FOLLOWUP, PERMISSIONS.HOMECARE_ESCALATE, PERMISSIONS.DISCHARGE_VIEW, PERMISSIONS.DISCHARGE_PLAN_MANAGE, PERMISSIONS.DISCHARGE_REVIEW, PERMISSIONS.DISCHARGE_FINALIZE, PERMISSIONS.AFTERCARE_VIEW, PERMISSIONS.AFTERCARE_PLAN_MANAGE, PERMISSIONS.AFTERCARE_FOLLOWUP_DOCUMENT, PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_CHARGE_CREATE, PERMISSIONS.BILLING_INVOICE_CREATE, PERMISSIONS.BILLING_INVOICE_FINALIZE, PERMISSIONS.BILLING_PAYMENT_RECORD, PERMISSIONS.BILLING_ADJUSTMENT_CREATE, PERMISSIONS.BILLING_INVOICE_VOID, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_RECEIVE, PERMISSIONS.INVENTORY_ISSUE, PERMISSIONS.INVENTORY_REQUEST, PERMISSIONS.INVENTORY_TRANSFER_APPROVE, PERMISSIONS.INVENTORY_TRANSFER_ISSUE, PERMISSIONS.INVENTORY_TRANSFER_RECEIVE, PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.THERAPY_SCHEDULE, PERMISSIONS.FACILITY_VIEW, PERMISSIONS.FACILITY_MANAGE, PERMISSIONS.BED_VIEW, PERMISSIONS.BED_ASSIGN, PERMISSIONS.BED_TRANSFER, PERMISSIONS.BED_LEAVE, PERMISSIONS.BED_RELEASE, PERMISSIONS.INCIDENT_VIEW, PERMISSIONS.INCIDENT_REVIEW]
  },
  centreB: {
    id: 'centre-b-admin', label: 'Centre B Administrator', workspace: WORKSPACES.CENTRE_OPERATIONS,
    tenant: 'Veda Wellness', location: 'Centre B', modules: ['operations', 'facility', 'residential', 'nursing', 'medication'],
    permissions: [...basePermissions, 'clients.view', PERMISSIONS.FACILITY_VIEW, PERMISSIONS.BED_VIEW, PERMISSIONS.BED_ASSIGN, PERMISSIONS.BED_TRANSFER, PERMISSIONS.BED_LEAVE, PERMISSIONS.NURSING_VIEW, PERMISSIONS.RESIDENTIAL_VIEW, PERMISSIONS.MAR_VIEW]
  },
  tenant2: {
    id: 'tenant2-centre-admin', label: 'Tenant T2 Centre Administrator', workspace: WORKSPACES.CENTRE_OPERATIONS,
    tenant: 'Tenant T2', location: 'Tenant T2 Centre', modules: ['operations', 'facility', 'residential', 'nursing'],
    permissions: [...basePermissions, 'clients.view', PERMISSIONS.FACILITY_VIEW, PERMISSIONS.BED_VIEW, PERMISSIONS.BED_ASSIGN, PERMISSIONS.NURSING_VIEW, PERMISSIONS.RESIDENTIAL_VIEW]
  },
  clinician: {
    id: 'clinician', label: 'Psychiatrist / Clinician', workspace: WORKSPACES.CLINICIAN_WORKSPACE,
    tenant: 'Veda Wellness', location: 'Greater Noida Centre', modules: ['clinical', 'mdt', 'medication', 'ai-assistance', 'ai', 'nutrition', 'family', 'telehealth', 'discharge', 'aftercare', 'documents', 'consent', 'compliance', 'audit', 'analytics', 'reports'],
    permissions: [...basePermissions, 'clients.view', 'clinical.work', PERMISSIONS.CLINICAL_VIEW, PERMISSIONS.CLINICAL_EDIT, PERMISSIONS.CLINICAL_REVIEW, PERMISSIONS.CLINICAL_SIGN, PERMISSIONS.RISK_VIEW, PERMISSIONS.RISK_MANAGE, PERMISSIONS.CARE_TEAM_VIEW, PERMISSIONS.CARE_TEAM_MANAGE, PERMISSIONS.TREATMENT_VIEW, PERMISSIONS.TREATMENT_EDIT, PERMISSIONS.TREATMENT_APPROVE, PERMISSIONS.MDT_VIEW, PERMISSIONS.MDT_PARTICIPATE, PERMISSIONS.MDT_FINALIZE, PERMISSIONS.THERAPY_SCHEDULE, PERMISSIONS.THERAPY_VIEW, PERMISSIONS.THERAPY_DOCUMENT, PERMISSIONS.THERAPY_REVIEW, PERMISSIONS.THERAPY_SIGN, PERMISSIONS.STANDARDIZED_VIEW, PERMISSIONS.STANDARDIZED_COMPLETE, PERMISSIONS.STANDARDIZED_FINALIZE, PERMISSIONS.MEDICATION_VIEW, PERMISSIONS.MEDICATION_ORDER, PERMISSIONS.MEDICATION_REVIEW, PERMISSIONS.MEDICATION_DISCONTINUE, PERMISSIONS.MAR_VIEW, PERMISSIONS.MAR_CORRECT, PERMISSIONS.NUTRITION_VIEW, PERMISSIONS.NUTRITION_ASSESS, PERMISSIONS.NUTRITION_PLAN_MANAGE, PERMISSIONS.FAMILY_VIEW, PERMISSIONS.FAMILY_MANAGE, PERMISSIONS.FAMILY_SESSION_DOCUMENT, PERMISSIONS.TELEHEALTH_VIEW, PERMISSIONS.TELEHEALTH_SCHEDULE, PERMISSIONS.TELEHEALTH_SESSION_MANAGE, PERMISSIONS.DISCHARGE_VIEW, PERMISSIONS.DISCHARGE_PLAN_MANAGE, PERMISSIONS.DISCHARGE_REVIEW, PERMISSIONS.DISCHARGE_FINALIZE, PERMISSIONS.AFTERCARE_VIEW, PERMISSIONS.AFTERCARE_PLAN_MANAGE, PERMISSIONS.AFTERCARE_FOLLOWUP_DOCUMENT, PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_CHARGE_CREATE, PERMISSIONS.BILLING_INVOICE_CREATE, PERMISSIONS.BILLING_INVOICE_FINALIZE, PERMISSIONS.BILLING_PAYMENT_RECORD, PERMISSIONS.BILLING_ADJUSTMENT_CREATE, PERMISSIONS.BILLING_INVOICE_VOID, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_ITEM_MANAGE, PERMISSIONS.INVENTORY_RECEIVE, PERMISSIONS.INVENTORY_ISSUE, PERMISSIONS.INVENTORY_REQUEST, PERMISSIONS.INVENTORY_TRANSFER_APPROVE, PERMISSIONS.INVENTORY_TRANSFER_ISSUE, PERMISSIONS.INVENTORY_TRANSFER_RECEIVE, PERMISSIONS.INVENTORY_ADJUST, PERMISSIONS.DOCUMENTS_VIEW, PERMISSIONS.DOCUMENTS_UPLOAD, PERMISSIONS.DOCUMENTS_VERSION_CREATE, PERMISSIONS.CONSENT_VIEW, PERMISSIONS.CONSENT_CAPTURE, PERMISSIONS.CONSENT_REVOKE, PERMISSIONS.COMPLIANCE_VIEW, PERMISSIONS.COMPLIANCE_MANAGE, PERMISSIONS.AUDIT_VIEW, PERMISSIONS.AUDIT_SENSITIVE_VIEW, PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.ANALYTICS_FINANCIAL_VIEW, PERMISSIONS.ANALYTICS_INVENTORY_VIEW, PERMISSIONS.REPORTS_EXPORT, PERMISSIONS.AI_USE, PERMISSIONS.AI_SUMMARY, PERMISSIONS.AI_DRAFT, PERMISSIONS.AI_REVIEW, PERMISSIONS.AI_APPLY, PERMISSIONS.AI_HISTORY, 'clinical.edit', 'clinical.sign', 'care-team.manage', 'treatment-plan.manage', 'mdt.view', 'mdt.manage', 'ai.assistance']
  },
  nurse: {
    id: 'nurse', label: 'Nurse', workspace: WORKSPACES.NURSING_WORKSPACE,
    tenant: 'Veda Wellness', location: 'Residential Unit A', modules: ['nursing', 'medication', 'residential'],
    permissions: [...basePermissions, 'clients.view', PERMISSIONS.CLINICAL_VIEW, PERMISSIONS.RISK_VIEW, PERMISSIONS.CARE_TEAM_VIEW, PERMISSIONS.TREATMENT_VIEW, PERMISSIONS.NURSING_VIEW, PERMISSIONS.NURSING_DOCUMENT, PERMISSIONS.NURSING_REVIEW, PERMISSIONS.OBSERVATIONS_VIEW, PERMISSIONS.OBSERVATIONS_RECORD, PERMISSIONS.OBSERVATIONS_CORRECT, PERMISSIONS.MEDICATION_VIEW, PERMISSIONS.MEDICATION_REVIEW, PERMISSIONS.MAR_VIEW, PERMISSIONS.MAR_ADMINISTER, PERMISSIONS.PRN_VIEW, PERMISSIONS.PRN_ADMINISTER, PERMISSIONS.PRN_EFFECTIVENESS, PERMISSIONS.HANDOVER_VIEW, PERMISSIONS.HANDOVER_CREATE, PERMISSIONS.HANDOVER_FINALIZE, 'nursing.shift', 'medication.view', 'handover.manage']
  },
  residential: {
    id: 'residential', label: 'Residential Care Staff', workspace: WORKSPACES.RESIDENTIAL_WORKSPACE,
    tenant: 'Veda Wellness', location: 'Residential Unit A', modules: ['residential', 'facility'],
    permissions: [...basePermissions, PERMISSIONS.CLIENTS_VIEW, 'residents.view', PERMISSIONS.RESIDENTIAL_VIEW, PERMISSIONS.RESIDENTIAL_DOCUMENT, PERMISSIONS.HANDOVER_VIEW, PERMISSIONS.HANDOVER_CREATE, PERMISSIONS.HANDOVER_FINALIZE, PERMISSIONS.INCIDENT_VIEW, PERMISSIONS.INCIDENT_CREATE, 'residential.shift', 'incidents.create', 'handover.manage']
  },
  homeCare: {
    id: 'home-care', label: 'Home-Care Coordinator', workspace: WORKSPACES.HOME_CARE_OPERATIONS,
    tenant: 'Veda Wellness', location: 'Greater Noida Community Service', modules: ['home-care', 'scheduling'],
    permissions: [...basePermissions, PERMISSIONS.CLIENTS_VIEW, PERMISSIONS.HOMECARE_VIEW, PERMISSIONS.HOMECARE_ENROLL, PERMISSIONS.HOMECARE_PLAN_MANAGE, PERMISSIONS.HOMECARE_VISIT_SCHEDULE, PERMISSIONS.HOMECARE_VISIT_START, PERMISSIONS.HOMECARE_VISIT_DOCUMENT, PERMISSIONS.HOMECARE_VISIT_COMPLETE, PERMISSIONS.HOMECARE_VISIT_CANCEL, PERMISSIONS.HOMECARE_VISIT_MISS, PERMISSIONS.HOMECARE_FOLLOWUP, PERMISSIONS.HOMECARE_ESCALATE, 'home-care.assign', 'caregivers.manage', 'escalations.view']
  },
  billing: {
    id: 'billing', label: 'Billing User', workspace: WORKSPACES.BILLING_OPERATIONS,
    tenant: 'Veda Wellness', location: 'All permitted centres', modules: ['billing', 'revenue'],
    permissions: [...basePermissions, PERMISSIONS.BILLING_VIEW, PERMISSIONS.BILLING_CHARGE_CREATE, PERMISSIONS.BILLING_INVOICE_CREATE, PERMISSIONS.BILLING_INVOICE_FINALIZE, PERMISSIONS.BILLING_PAYMENT_RECORD, PERMISSIONS.BILLING_ADJUSTMENT_CREATE, PERMISSIONS.BILLING_INVOICE_VOID, 'billing.manage']
  },
  inventory: {
    id: 'inventory', label: 'Inventory User', workspace: WORKSPACES.INVENTORY_OPERATIONS,
    tenant: 'Veda Wellness', location: 'Greater Noida Centre', modules: ['inventory'],
    permissions: [...basePermissions, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_ITEM_MANAGE, PERMISSIONS.INVENTORY_RECEIVE, PERMISSIONS.INVENTORY_ISSUE, PERMISSIONS.INVENTORY_REQUEST, PERMISSIONS.INVENTORY_TRANSFER_APPROVE, PERMISSIONS.INVENTORY_TRANSFER_ISSUE, PERMISSIONS.INVENTORY_TRANSFER_RECEIVE, PERMISSIONS.INVENTORY_ADJUST, 'inventory.manage']
  }
};

export function hasPermission(access, permission) {
  return access?.permissions.includes(permission) ?? false;
}

export function hasModule(access, module) {
  return access?.modules.includes(module) ?? false;
}

export function can(access, permission, module) {
  const tenantCommercialPermission = [PERMISSIONS.TENANT_SUBSCRIPTION_VIEW, PERMISSIONS.TENANT_SUBSCRIPTION_CHECKOUT, PERMISSIONS.TENANT_FACILITY_VIEW, PERMISSIONS.TENANT_FACILITY_CREATE, PERMISSIONS.TENANT_PAYMENT_VIEW].includes(permission);
  const granted = hasPermission(access, permission) || (tenantCommercialPermission && access?.workspace === WORKSPACES.TENANT_ADMINISTRATION);
  return granted && (!module || hasModule(access, module));
}

export function hasAnyPermission(access, permissions) { return permissions.some(permission => hasPermission(access, permission)); }
export function isLocationAllowed(access, location) { if (!location || access?.location === 'All regions' || access?.location === 'All centres' || access?.location === 'All permitted centres') return true; if (access?.location === location) return true; if (access?.location === 'Greater Noida Centre' && ['Residential Unit A', 'Greater Noida Community Service'].includes(location)) return true; return access?.location === 'Greater Noida Community Service' && location === 'Residential Unit A'; }
export function isTenantAllowed(access, tenant) { return !tenant || !access?.tenant || access.tenant === tenant || access.tenant === 'MedixPro360 Platform'; }

export function getAccessProfile(profileId = 'clinician') {
  const profile = demoProfiles[profileId] ?? demoProfiles.clinician;
  if (profileId === 'tenant') return { ...profile, permissions: [...profile.permissions, PERMISSIONS.TENANT_SUBSCRIPTION_VIEW, PERMISSIONS.TENANT_SUBSCRIPTION_CHECKOUT, PERMISSIONS.TENANT_FACILITY_VIEW, PERMISSIONS.TENANT_FACILITY_CREATE, PERMISSIONS.TENANT_PAYMENT_VIEW] };
  return profile;
}
