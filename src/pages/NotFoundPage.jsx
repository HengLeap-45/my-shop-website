import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found');

  return (
    <section className="py-24 text-center">
      <div className="mx-auto max-w-lg px-4">
        <p className="text-8xl font-bold text-indigo-600">404</p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-500">
          Sorry, we couldn&rsquo;t find the page you&rsquo;re looking for. It might have been
          moved or no longer exists.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
