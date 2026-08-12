export { useAdminAuthorization } from './hooks/useAdminAuthorization';
export { adminAuthorizationService } from './services/adminAuthorizationService';
export { adminUsersService } from './services/adminUsersService';
export { adminConsultationsService } from './services/adminConsultationsService';
export { adminOpsService } from './services/adminOpsService';
export { adminFortuneMailService } from './services/adminFortuneMailService';
export type {
  AdminFortuneMailDetail,
  AdminFortuneMailListItem,
  AdminFortuneMailStatus,
  AdminFortuneMailTimelineEntry,
} from './services/adminFortuneMailService';
export { adminIntelligenceService } from './services/adminIntelligenceService';
export type {
  AdminIntelligenceRunListItem,
  AdminIntelligenceRunDetail,
  AdminAssessmentRow,
  AdminOutcomeRow,
} from './services/adminIntelligenceService';

export { AdminShell } from './components/AdminShell';
export { AdminSidebar } from './components/AdminSidebar';
export { AdminTopBar } from './components/AdminTopBar';
export { KpiCard } from './components/KpiCard';
export type { KpiTrend } from './components/KpiCard';
export { AdminDetailDrawer } from './components/AdminDetailDrawer';
export { AdminTable } from './components/AdminTable';
export type { AdminTableColumn } from './components/AdminTable';
export { AdminBadge } from './components/AdminBadge';
export type { AdminBadgeTone } from './components/AdminBadge';
export { FortuneMailDetailDrawer } from './components/FortuneMailDetailDrawer';
export { AdminGate } from './components/AdminGate';
export { AdminPageHeader } from './components/AdminPageHeader';
export { AdminStateView } from './components/AdminStateView';
export { AdminSelect } from './components/AdminSelect';
export { AdminDataTable } from './components/AdminDataTable';
export { AdminPagination } from './components/AdminPagination';
export { AdminSearchInput } from './components/AdminSearchInput';
export { AdminDetailSection } from './components/AdminDetailSection';
export { TrendChart } from './components/TrendChart';
export { confirmDestructive } from './confirm';

export type { AdminColumn } from './components/AdminDataTable';
export type { AdminDetailRow } from './components/AdminDetailSection';
export type { AdminSelectOption } from './components/AdminSelect';

export type {
  AdminAiUsageItem,
  AdminAiUsageParams,
  AdminDailyActivityPoint,
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
