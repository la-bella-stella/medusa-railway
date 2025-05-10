// src/lib/config/constants.ts
import { atom } from "jotai";
import { MaintenanceSettings } from "@lib/data/maintenance"; // Import MaintenanceSettings

export const RESPONSIVE_WIDTH = 768;
export const isMultiLangEnable = true;

// Atom to store fetched maintenance settings
export const maintenanceSettingsAtom = atom<MaintenanceSettings | null>(null);

// Derived atoms based on maintenance settings
export const checkIsMaintenanceModeComing = atom((get) => {
  const settings = get(maintenanceSettingsAtom);
  if (!settings?.maintenance?.start) return false;

  const now = new Date();
  const startDate = new Date(settings.maintenance.start);
  // Maintenance is "coming" if the start date is in the future
  return now < startDate;
});

export const checkIsShopMaintenanceModeComing = atom((get) => {
  const settings = get(maintenanceSettingsAtom);
  if (!settings?.maintenance?.start || !settings.maintenance.shopMaintenance) return false;

  const now = new Date();
  const startDate = new Date(settings.maintenance.start);
  // Shop maintenance is "coming" if the start date is in the future and shopMaintenance is true
  return now < startDate && settings.maintenance.shopMaintenance;
});

export const checkIsMaintenanceModeStart = atom<boolean, [boolean], void>(
  (get) => {
    const settings = get(maintenanceSettingsAtom);
    if (!settings?.maintenance?.start) return false;

    const now = new Date();
    const startDate = new Date(settings.maintenance.start);
    // Maintenance has started if the start date is in the past
    return now >= startDate;
  },
  (get, set, newValue: boolean) => {
    set(checkIsMaintenanceModeStart, newValue);
  }
);

export const checkIsShopMaintenanceModeStart = atom<boolean, [boolean], void>(
  (get) => {
    const settings = get(maintenanceSettingsAtom);
    if (!settings?.maintenance?.start || !settings.maintenance.shopMaintenance) return false;

    const now = new Date();
    const startDate = new Date(settings.maintenance.start);
    // Shop maintenance has started if the start date is in the past and shopMaintenance is true
    return now >= startDate && settings.maintenance.shopMaintenance;
  },
  (get, set, newValue: boolean) => {
    set(checkIsShopMaintenanceModeStart, newValue);
  }
);

export const checkIsScrollingStart = atom(false);