import { create } from 'zustand';
import type { SpaService, Appointment, Member } from '@/types';
import { SERVICES } from '@/data/services';
import { APPOINTMENTS } from '@/data/appointments';
import { CURRENT_MEMBER } from '@/data/members';

interface AppState {
  services: SpaService[];
  appointments: Appointment[];
  currentMember: Member;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointmentStatus: (id: number, status: Appointment['status']) => void;
  updateAppointmentDuration: (id: number, duration: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  services: SERVICES,
  appointments: APPOINTMENTS,
  currentMember: CURRENT_MEMBER,
  selectedCategory: 'all',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  addAppointment: (appointment) =>
    set((state) => ({ appointments: [appointment, ...state.appointments] })),
  updateAppointmentStatus: (id, status) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),
  updateAppointmentDuration: (id, duration) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, duration } : a
      ),
    })),
}));
