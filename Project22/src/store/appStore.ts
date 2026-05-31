import { create } from 'zustand'

interface User {
  id: string
  username: string
  displayName: string
  role: string
}

interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: number
}

interface InspectionUpdate {
  id: string
  lineName: string
  cameraName: string
  result: 'PASS' | 'FAIL'
  defectType?: string
  confidence: number
  timestamp: string
}

interface AppState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  removeAlert: (id: string) => void
  inspectionUpdates: InspectionUpdate[]
  addInspectionUpdate: (update: InspectionUpdate) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          ...alert,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
  inspectionUpdates: [],
  addInspectionUpdate: (update) =>
    set((state) => ({
      inspectionUpdates: [update, ...state.inspectionUpdates].slice(0, 50),
    })),
}))
