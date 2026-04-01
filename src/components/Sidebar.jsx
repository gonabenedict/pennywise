import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';
import { useGetUserInfo } from '../hooks/useGetUserInfo';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, profilePhoto } = useGetUserInfo();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const capitalizeFirstLetters = (str) => {
    if (!str) return 'User';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/expense-tracker' },
    { label: 'Planner', icon: 'calendar_today', path: '/planner' },
    { label: 'Quick Add', icon: 'add_circle', path: '/quick-add' },
    { label: 'History', icon: 'history', path: '/history' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 py-8 px-6 bg-slate-50 dark:bg-slate-900/50 border-r border-surface-container-high flex flex-col font-body text-sm font-medium tracking-tight">
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold tracking-tighter text-primary dark:text-primary-fixed">Pennywise</h1>
        <p className="text-xs text-on-surface-variant font-normal">Finance Tracker</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive(item.path)
                ? 'text-primary dark:text-primary-fixed font-bold border-r-2 border-primary dark:border-primary-fixed bg-primary/10 dark:bg-primary/20'
                : 'text-on-surface-variant hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'
            }`}
          >
            <span className="material-symbols-outlined" data-icon={item.icon}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {name && (
        <div className="mt-auto pt-6 border-t border-surface-container-high">
          <div className="flex items-center gap-3 mb-4 px-2">
            {profilePhoto && <img src={profilePhoto} alt="User Profile" className="w-10 h-10 rounded-full object-cover" />}
            <span className="text-sm font-semibold text-on-surface truncate">{capitalizeFirstLetters(name)}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};
