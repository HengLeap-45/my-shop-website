import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#FAF9F6] text-slate-900">
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
