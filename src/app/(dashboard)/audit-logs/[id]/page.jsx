'use client';
import AuditLogDetail from '@/modules/auditLogs/AuditLogDetail';
export default function AuditLogDetailPage({ params }) {
  return <AuditLogDetail logId={params.id} />;
}
