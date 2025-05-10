// src/lib/data/maintenance.ts
export interface MaintenanceSettings {
    maintenance: {
      start: string; // ISO date string (e.g., "2025-07-11T05:00:00")
      shopMaintenance?: boolean; // Optional flag for shop-specific maintenance
    };
  }
  
  // Static function to return hardcoded maintenance settings
  export async function fetchMaintenanceSettings(): Promise<MaintenanceSettings> {
    return {
      maintenance: {
        start: "2025-07-11T05:00:00", // Hardcoded start date
        shopMaintenance: false, // Hardcoded flag for shop-specific maintenance
      },
    };
  }