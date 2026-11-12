
import {
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';

import {
  Users,
  FolderOpen,
  CalendarDays,
  Landmark,
  ArrowUpRight,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import DashboardAnalytics from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Cases from './pages/Cases';

import Courts from './pages/Courts';
import Hearings from './pages/Hearings';


import MainLayout from './layouts/MainLayout';
import { useAuth } from './context/AuthContext';
import Documents from './pages/Documents';

// PROTECTED ROUTE

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        Loading CFMS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// DASHBOARD CARD

const DashboardCard = ({
  title,
  description,
  icon: Icon,
  link,
  color,
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={25} />
        </div>

        <ArrowUpRight size={20} className="text-slate-300" />
      </div>

      <h3 className="text-lg font-bold text-[#17243B] mt-6">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {description}
      </p>
    </>
  );

  if (!link) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 opacity-75">
        {content}

        <span className="inline-block mt-4 text-xs text-slate-500 border rounded px-2 py-1">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      to={link}
      className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
    >
      {content}
    </Link>
  );
};

// DASHBOARD

const Dashboard = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'Admin';

  const cards = isAdmin
    ? [
        {
          title: 'User Management',
          description: 'Create and manage judicial staff accounts.',
          icon: Users,
          link: '/register',
          color: 'bg-blue-50 text-blue-700',
        },
        {
          title: 'Case Management',
          description: 'Manage and monitor judicial cases.',
          icon: FolderOpen,
          link: '/cases',
          color: 'bg-amber-50 text-amber-700',
        },
        {
          title: 'Hearings',
          description: 'View and organize court hearings.',
          icon: CalendarDays,
          link: '/hearings',
          color: 'bg-green-50 text-green-700',
        },
        {
          title: 'Court Management',
          description: 'Manage courts and judicial assignments.',
          icon: Landmark,
          link: '/courts',
          color: 'bg-purple-50 text-purple-700',
        },
      ]
    : [
        {
          title: 'Case Management',
          description: 'Access your authorized case records.',
          icon: FolderOpen,
          link: '/cases',
          color: 'bg-blue-50 text-blue-700',
        },
        {
          title: 'Hearings',
          description: 'View scheduled court hearings.',
          icon: CalendarDays,
          link: '/hearings',
          color: 'bg-green-50 text-green-700',
        },
      ];

  return (
    <MainLayout>

      {/* WELCOME SECTION */}

      <section className="bg-white border border-slate-200 rounded-2xl p-7 sm:p-9 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          <div>
            <p className="text-sm font-bold text-[#B18B50] uppercase tracking-widest">
              {isAdmin ? 'Administration Portal' : 'Judicial Portal'}
            </p>

            <h1 className="text-3xl font-bold text-[#17243B] mt-3">
              Welcome, {user?.fullName}
            </h1>

            <p className="text-slate-500 mt-3">
              Judicial Case Flow Management System
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F4F6FA] border border-slate-200 rounded-xl p-4">
            <div className="bg-[#172B4D] p-3 rounded-full">
              <UserCircle size={25} className="text-white" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Signed in as
              </p>

              <p className="font-bold text-[#17243B]">
                {user?.role}
              </p>

              <p className="text-xs text-slate-500">
                {user?.designation}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* DASHBOARD MODULES */}
          

      <section className="mt-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#17243B]">
            Dashboard Overview
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Access your available system modules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>
      </section>
        <DashboardAnalytics />

      {/* ADMIN INFORMATION */}

      {isAdmin && (
        <section className="mt-8 bg-[#172B4D] text-white rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <ShieldCheck size={27} className="text-[#C5A46D]" />
            </div>

            <div>
              <h3 className="font-bold text-lg">
                Administrator Access
              </h3>

              <p className="text-sm text-slate-300 mt-1">
                You have administrative access to manage system users.
              </p>
            </div>
          </div>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-[#C5A46D] hover:bg-[#D4B783] text-[#101D35] font-bold px-5 py-3 rounded-xl transition"
          >
            Manage Users
            <ArrowUpRight size={18} />
          </Link>
        </section>
      )}

      <footer className="text-center text-xs text-slate-400 mt-12">
        © 2026 CFMS | Judicial Case Flow Management System
      </footer>

    </MainLayout>
  );
};

// APP ROUTES

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to={user ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/register"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Register />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <Cases />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courts"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Courts />
          </ProtectedRoute>
        }
      />

      {/* HEARINGS MANAGEMENT */}

      <Route
        path="/hearings"
        element={
          <ProtectedRoute>
            <Hearings />
          </ProtectedRoute>
        }
      />

      <Route
  path="/documents"
  element={
    <ProtectedRoute>
      <Documents />
    </ProtectedRoute>
  }
/>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;
