'use client';
import { useSearchParams } from 'next/navigation';
import ServiceDetail from '@/modules/services/ServiceDetail';

export default function ServiceDetailPage({ params }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'details';
  return <ServiceDetail serviceId={params.id} defaultTab={tab} />;
}
