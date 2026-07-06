'use client';
import RoundDetail from '@/modules/rounds/RoundDetail';
export default function RoundDetailPage({ params }) {
  return <RoundDetail roundId={params.id} />;
}
