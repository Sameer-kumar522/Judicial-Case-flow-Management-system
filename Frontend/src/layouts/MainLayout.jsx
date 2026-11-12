
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F6FA] flex">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="p-6 md:p-8">
          {children}
        </main>

      </div>

    </div>
  );
};

export default MainLayout;
