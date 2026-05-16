import { create } from 'zustand';
import { client } from '@/lib/api';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
  saveTheme: (theme: Theme) => Promise<void>;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: (localStorage.getItem('livemask_theme') as Theme) || 'light',
  isLoading: false,

  setTheme: (theme: Theme) => {
    localStorage.setItem('livemask_theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next: Theme = current === 'light' ? 'dark' : 'light';
    get().setTheme(next);
    get().saveTheme(next);
  },

  loadTheme: async () => {
    // First apply local preference
    const local = (localStorage.getItem('livemask_theme') as Theme) || 'light';
    applyTheme(local);
    set({ theme: local });

    // Then try to load from database
    try {
      const user = await client.auth.me();
      if (user?.data) {
        const res = await client.entities.user_preferences.query({
          query: {},
          limit: 1,
        });
        if (res?.data?.items?.length > 0) {
          const pref = res.data.items[0] as { theme?: string };
          if (pref.theme && (pref.theme === 'light' || pref.theme === 'dark')) {
            localStorage.setItem('livemask_theme', pref.theme);
            applyTheme(pref.theme);
            set({ theme: pref.theme });
          }
        }
      }
    } catch {
      // Use local preference if DB fetch fails
    }
  },

  saveTheme: async (theme: Theme) => {
    try {
      const user = await client.auth.me();
      if (!user?.data) return;

      // Try to find existing preference
      const res = await client.entities.user_preferences.query({
        query: {},
        limit: 1,
      });

      if (res?.data?.items?.length > 0) {
        const existing = res.data.items[0] as { id: number };
        await client.entities.user_preferences.update({
          id: String(existing.id),
          data: { theme },
        });
      } else {
        await client.entities.user_preferences.create({
          data: { theme, language: 'en' },
        });
      }
    } catch {
      // Silently fail - local storage still works
    }
  },
}));