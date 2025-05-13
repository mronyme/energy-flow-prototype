
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// This hook acts as a bridge to the AuthContext, making it easier to import
export const useAuth = useAuthContext;

// Add explicit export for compatibility
export default useAuth;
