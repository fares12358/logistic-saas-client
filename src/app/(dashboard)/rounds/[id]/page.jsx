'use client';
import { use } from 'react';
import RoundDetail from '@/modules/rounds/RoundDetail';

export default function RoundDetailPage({ params }) {
  const { id } = use(params);
  return <RoundDetail roundId={id} />;
}
