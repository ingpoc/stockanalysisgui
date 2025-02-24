import { useRouter } from 'next/navigation';

export const useAuthNavigation = () => {
  const router = useRouter();

  return {
    toLogin: (returnUrl?: string) => {
      const searchParams = new URLSearchParams();
      if (returnUrl) searchParams.set('returnTo', returnUrl);
      router.replace(`/auth/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    },
    toDashboard: () => router.replace('/dashboard'),
    toProtectedRoute: (path: string) => {
      if (typeof window === 'undefined') return;
      router.replace(path);
    }
  };
};

// Utility to validate return URLs
export const isValidReturnUrl = (url: string): boolean => {
  // Add validation logic here (e.g., must be internal URL, no external redirects)
  return url.startsWith('/') && !url.startsWith('//');
}; 