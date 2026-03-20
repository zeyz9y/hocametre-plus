import { createContext } from 'react';

export const ProfileRefreshContext = createContext<() => void>(() => {});
