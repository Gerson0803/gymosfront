'use client';

import { useEffect } from 'react';
import { useGymStore } from '@/store/useGymStore';

export default function TitleUpdater() {
  const { gymName } = useGymStore();

  useEffect(() => {
    document.title = `${gymName} - Gym Management Dashboard`;
  }, [gymName]);

  return null;
}
