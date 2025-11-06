import './globals.css';
import HeaderNav from '../components/HeaderNav';

export const metadata = {
  title: 'BMC Analyzer',
  description: 'Aplikasi untuk menganalisis Business Model Canvas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-700">BMC Analyzer</h1>
            <HeaderNav />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500">
            Dibangunkan untuk pembelajaran keusahawanan — BMC Analyzer
          </div>
        </footer>
      </body>
    </html>
  );
}


