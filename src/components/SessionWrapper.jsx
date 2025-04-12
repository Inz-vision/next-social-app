'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useModalStore } from '../store/modalStore';

const SessionWrapper = ({ children }) => {
  const { user, isSignedIn } = useUser(); // Clerk's user data
  const setUser = useModalStore((state) => state.setUser);
  const clearUser = useModalStore((state) => state.clearUser);

  useEffect(() => {
    if (isSignedIn) {
      // Set user data in Zustand store
      setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        image: user.profileImageUrl,
      });
    } else {
      // Clear user data if not signed in
      clearUser();
    }
  }, [isSignedIn, user, setUser, clearUser]);

  return <>{children}</>;
};

export default SessionWrapper;