import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token) => {
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...userData };
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 1 });
    set({ user: updatedUser });
  }
}));

export const useTrainingStore = create((set) => ({
  modules: [],
  currentModule: null,
  currentSession: null,
  sessionHistory: [],
  isLoading: false,
  error: null,

  setModules: (modules) => set({ modules }),
  setCurrentModule: (module) => set({ currentModule: module }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setSessionHistory: (sessions) => set({ sessionHistory: sessions }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}));

export const useCollaborativeStore = create((set) => ({
  rooms: [],
  currentRoom: null,
  roomUsers: [],
  roomState: null,
  messages: [],
  cursors: {},

  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room }),
  setRoomUsers: (users) => set({ roomUsers: users }),
  setRoomState: (state) => set({ roomState: state }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setCursor: (userId, position) => set((state) => ({
    cursors: { ...state.cursors, [userId]: position }
  })),
  clearRoom: () => set({
    currentRoom: null,
    roomUsers: [],
    roomState: null,
    messages: [],
    cursors: {}
  })
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  notification: null,
  modal: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  showNotification: (notification) => set({ notification }),
  hideNotification: () => set({ notification: null }),
  showModal: (modal) => set({ modal }),
  hideModal: () => set({ modal: null })
}));
