'use client';

import { useEffect } from 'react';
import { useAppSettings } from '@/context/app-settings-context';

export default function TitleUpdater() {
  const { gymName } = useAppSettings();

  useEffect(() => {
    document.title = `${gymName} - GymOS`;
  }, [gymName]);

  return null;
}
