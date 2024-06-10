import { useCallback, useState } from 'react';
import { retrieveAppSettings, storeAppSettings } from '../lib/engine';
import { AppSettings } from '../lib/types';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | undefined>(
    retrieveAppSettings()
  );
  const updateSettings = useCallback((settings: AppSettings) => {
    storeAppSettings(settings);
    setSettings(settings);
    return settings;
  }, []);
  return {
    settings,
    updateSettings,
  };
}
