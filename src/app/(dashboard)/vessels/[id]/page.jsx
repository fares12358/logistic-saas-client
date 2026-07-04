'use client';
import { use } from 'react';
import VesselForm from '../../../../modules/vessels/VesselForm';
export default function EditVesselPage({ params }) {
  const { id } = use(params);
  return <VesselForm id={id} />;
}
