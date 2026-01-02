import { init } from '@instantdb/react';

const APP_ID = import.meta.env.VITE_INSTANTDB_APP_ID;

if (!APP_ID || APP_ID.includes('your_instantdb_app_id')) {
    console.error("InstantDB App ID missing! Real-time features will not work.");
}

export const db = init({ appId: APP_ID || 'mock_app_id' });
