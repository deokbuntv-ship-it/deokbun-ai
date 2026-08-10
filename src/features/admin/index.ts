export { useAdminAuthorization } from './hooks/useAdminAuthorization';
export { adminAuthorizationService } from './services/adminAuthorizationService';
export { adminUsersService } from './services/adminUsersService';
export { adminConsultationsService } from './services/adminConsultationsService';
export { adminOpsService } from './services/adminOpsService';

export { AdminShell } from './components/AdminShell';
export { AdminSidebar } from './components/AdminSidebar';
export { AdminGate } from './components/AdminGate';
export { AdminPageHeader } from './components/AdminPageHeader';
export { AdminStateView } from './components/AdminStateView';
export { AdminSelect } from './components/AdminSelect';
export { AdminDataTable } from './components/AdminDataTable';
export { AdminPagination } from './components/AdminPagination';
export { AdminSearchInput } from './components/AdminSearchInput';
export { AdminDetailSection } from './components/AdminDetailSection';

export type { AdminColumn } from './components/AdminDataTable';
export type { AdminDetailRow } from './components/AdminDetailSection';
export type { AdminSelectOption } from './components/AdminSelect';

export type {
  AdminAiUsageItem,
  AdminAiUsageParams,
  AdminAuthorizationStatus,
  AdminConsultationDetail,
  AdminConsultationListItem,
  AdminConsultationListParams,
  AdminDashboardOverview,
  AdminMessageMeta,
  AdminNavKey,
  AdminResolvedStatus,
  AdminSubjectSummary,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListParams,
} from './types';
