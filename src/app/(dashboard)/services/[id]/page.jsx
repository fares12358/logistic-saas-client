'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import ServiceDetail from '@/modules/services/ServiceDetail';

export default function ServiceDetailPage({ params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'details';
  return <ServiceDetail serviceId={id} defaultTab={tab} />;
}
