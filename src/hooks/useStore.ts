import { useEffect, useState } from 'react';
import { store } from '../services/store';

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = store.getCurrentUser();
  const currentGym = store.getCurrentGym();
  const gymSettings = currentGym?.settings;

  return {
    store,
    currentUser,
    currentGym,
    gymSettings,
    role: currentUser?.role || 'gym_owner',
    isSuperAdmin: currentUser?.role === 'super_admin',
    isGymOwner: currentUser?.role === 'gym_owner',
    isStaff: currentUser?.role === 'staff',
    isMember: currentUser?.role === 'member',
  };
}
