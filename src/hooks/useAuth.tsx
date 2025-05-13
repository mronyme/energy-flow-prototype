
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * This hook provides access to authentication context
 * It's a simple re-export of the context hook for better maintainability
 */
export const useAuth = useAuthContext;

export default useAuth;
