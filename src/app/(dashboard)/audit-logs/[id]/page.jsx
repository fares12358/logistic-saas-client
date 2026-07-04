'use client';
import { use } from 'react';
import AuditLogDetail from '../../../../modules/auditLogs/AuditLogDetail';
export default function AuditLogDetailPage({ params }) {
  const { id } = use(params);
  return <AuditLogDetail id={id} />;
}
