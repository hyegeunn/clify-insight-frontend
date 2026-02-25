import type { IconName } from "@/utils/icons";

// ============================================
// Sidebar
// ============================================
export interface MenuItem {
  id: string;
  label: string;
  path?: string;
  children?: MenuItem[];
  defaultOpen?: boolean;
  icon?: IconName;
}
