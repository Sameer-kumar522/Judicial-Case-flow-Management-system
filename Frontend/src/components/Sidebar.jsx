
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CalendarDays,
  Landmark,
  FileText,
  BriefcaseBusiness,
  ClipboardList,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const menuByRole = {
  Admin: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/register', icon: Users },
    { name: 'Case Management', path: '/cases', icon: FolderOpen },
    { name: 'Hearings', path: '/hearings', icon: CalendarDays },
    { name: 'Court Management',path: '/courts', icon: Landmark },
  ],

  Registrar: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Case Registration', icon: ClipboardList },
    { name: 'Case Management', icon: FolderOpen },
    { name: 'Hearings', path: '/hearings',icon: CalendarDays },
  ],

  Judge: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Cases', icon: FolderOpen },
    { name: 'Hearings',path: '/hearings', icon: CalendarDays },
  ],

  Clerk: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Case Records', icon: FolderOpen },
    { name: 'Documents', path: '/hearings', icon: FileText },
  ],

  Lawyer: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Cases', icon: BriefcaseBusiness },
    { name: 'Hearing Schedule', path: '/hearings', icon: CalendarDays },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = menuByRole[user?.role] || menuByRole.Clerk;

  return (
    <aside className="w-64 min-h-screen bg-[#101D35] text-white flex flex-col">

      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-[#C5A46D] p-3 rounded-xl">
            <Landmark size={24} className="text-[#101D35]" />
          </div>

          <div>
            <h1 className="text-xl font-bold">CFMS</h1>
            <p className="text-[10px] tracking-widest text-slate-400">
              JUDICIAL MANAGEMENT
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-7 pb-3">
        <p className="text-[11px] font-bold tracking-widest text-slate-500">
          MAIN MENU
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (!item.path) {
            return (
              <div
                key={item.name}
                title="Coming soon"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-slate-500 cursor-not-allowed"
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  <span className="text-sm">{item.name}</span>
                </span>

                <span className="text-[9px] border border-slate-700 rounded px-1.5 py-1">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#C5A46D] text-[#101D35]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-5 border-t border-white/10">
        <p className="text-xs text-slate-400">Logged in as</p>
        <p className="text-sm font-semibold mt-1">{user?.fullName}</p>
        <p className="text-xs text-[#C5A46D] mt-1">{user?.role}</p>
      </div>

    </aside>
  );
};

export default Sidebar;
