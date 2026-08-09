export { useAdminAuthorization } from './hooks/useAdminAuthorization';
export { adminAuthorizationService } from './services/adminAuthorizationService';
export { adminUsersService } from './services/adminUsersService';

export { AdminShell } from './components/AdminShell';
export { AdminSidebar } from './components/AdminSidebar';
export { AdminGate } from './components/AdminGate';
export { AdminPageHeader } from './components/AdminPageHeader';
export { AdminStateView } from './components/AdminStateView';
export { AdminDataTable } from './components/AdminDataTable';
export { AdminPagination } from './components/AdminPagination';
export { AdminSearchInput } from './components/AdminSearchInput';
export { AdminDetailSection } from './components/AdminDetailSection';

export type { AdminColumn } from './components/AdminDataTable';
export type { AdminDetailRow } from './components/AdminDetailSection';

export type {
  AdminAuthorizationStatus,
  AdminNavKey,
  AdminResolvedStatus,
  AdminSubjectSummary,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListParams,
} from './types';
