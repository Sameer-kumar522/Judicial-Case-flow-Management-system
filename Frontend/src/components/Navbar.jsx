
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pageNames = {
    '/dashboard': 'Dashboard',
    '/register': 'User Management',
  };

  const pageTitle = pageNames[location.pathname] || 'CFMS Portal';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between">

      <div>
        <h2 className="text-xl font-bold text-[#17243B]">
          {pageTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Judicial Case Flow Management System
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button
          type="button"
          title="Notifications"
          className="text-slate-500 hover:text-[#B18B50] transition"
        >
          <Bell size={21} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <UserCircle size={30} className="text-[#B18B50]" />

          <div>
            <p className="text-sm font-semibold text-[#17243B]">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>

    </header>
  );
};

export default Navbar;
