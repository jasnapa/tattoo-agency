import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();

  const logout = () => {
    logoutStore();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
};
