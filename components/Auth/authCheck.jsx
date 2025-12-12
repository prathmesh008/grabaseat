'use client'
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/authService';

// Custom hook for authentication checks
function useAuthCheck() {
  const router = useRouter();
  const authService = useMemo(() => new AuthService(), []);
  const currentUser = authService.getCurrentUser();

  // Check if the user has admin privileges
  const isAdmin = () => currentUser?.roles.includes('ROLE_ADMIN');

  // Check if the user is a regular user
  const isUser = () => currentUser?.roles.includes('ROLE_USER');

  // Redirect non-admins and non-users to the home page
  useEffect(() => {
    if (!isAdmin() && !isUser()) {
      router.push('/');
    }
  });

  // Expose isAdmin and isUser for conditional rendering or other checks
  return { isAdmin, isUser };
}

export default useAuthCheck;
