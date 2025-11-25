import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAccessToken, 
  getUserProfile, 
  getRefreshToken, 
  refreshAccessToken, 
  saveTokens 
} from '@/lib/auth';

/**
 * Custom hook to check if user is already authenticated and redirect to dashboard
 * Used on public pages like login, signup, and reset-password
 * @returns isCheckingAuth - boolean indicating if auth check is in progress
 */
export function useAuthRedirect() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      try {
        let accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        // If no access token but refresh token exists, try to refresh
        if (!accessToken && refreshToken) {
          try {
            const refreshed = await refreshAccessToken(refreshToken);
            saveTokens(refreshed.access, refreshed.refresh);
            accessToken = refreshed.access;
          } catch (error) {
            // Refresh failed, user needs to authenticate
            setIsCheckingAuth(false);
            return;
          }
        }

        // If we have an access token, check if it's valid by fetching user profile
        if (accessToken) {
          try {
            const userProfile = await getUserProfile(accessToken);
            
            // User is authenticated, redirect to appropriate dashboard
            const dashboardUrl = 
              userProfile.role === "admin"
                ? "/admin/dashboard"
                : userProfile.role === "trainer"
                ? "/trainer/dashboard"
                : "/student/dashboard";
            
            router.push(dashboardUrl);
            return;
          } catch (error) {
            // Token is invalid, user needs to authenticate
            setIsCheckingAuth(false);
          }
        } else {
          // No token, show the page
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsCheckingAuth(false);
      }
    }

    checkExistingSession();
  }, [router]);

  return { isCheckingAuth };
}
