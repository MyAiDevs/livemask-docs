import { create } from 'zustand';

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'degraded'
  | 'failed'
  | 'config_updating';

export interface SelectedNode {
  id: number;
  region: string;
  city: string;
  country_code: string;
  latency: number;
  protocol: string;
}

interface ConnectionStore {
  status: ConnectionState;
  selectedNode: SelectedNode | null;
  sessionStart: number | null;
  errorMessage: string | null;
  errorCode: string | null;
  configVersion: string;
  setStatus: (status: ConnectionState) => void;
  setSelectedNode: (node: SelectedNode | null) => void;
  connect: () => void;
  disconnect: () => void;
  retry: () => void;
  setError: (message: string, code?: string) => void;
  clearError: () => void;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  status: 'disconnected',
  selectedNode: null,
  sessionStart: null,
  errorMessage: null,
  errorCode: null,
  configVersion: 'v3.6.2',

  setStatus: (status) => set({ status }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  connect: () => {
    const { selectedNode } = get();
    if (!selectedNode) {
      set({
        status: 'failed',
        errorMessage: 'No node selected. Please select a node first.',
        errorCode: 'ERR_NO_NODE',
      });
      return;
    }

    set({ status: 'connecting', errorMessage: null, errorCode: null });

    // Simulate connection process
    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.75) {
        set({ status: 'connected', sessionStart: Date.now() });
      } else if (rand < 0.9) {
        set({
          status: 'degraded',
          sessionStart: Date.now(),
          errorMessage: 'This node is slower than usual.',
          errorCode: 'WARN_HIGH_LATENCY',
        });
      } else {
        set({
          status: 'failed',
          sessionStart: null,
          errorMessage: 'We could not connect to this node.',
          errorCode: 'ERR_CONN_TIMEOUT',
        });
      }
    }, 2000 + Math.random() * 1000);
  },

  disconnect: () => {
    set({
      status: 'disconnected',
      sessionStart: null,
      errorMessage: null,
      errorCode: null,
    });
  },

  retry: () => {
    get().connect();
  },

  setError: (message, code) =>
    set({ errorMessage: message, errorCode: code || null }),

  clearError: () => set({ errorMessage: null, errorCode: null }),
}));