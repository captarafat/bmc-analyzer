'use client';

import { usePathname } from 'next/navigation';

export default function HeaderNav() {
  const pathname = usePathname();
  const onTrainer = pathname?.startsWith('/trainer');

  return (
    <nav className="text-sm space-x-4">
      <a className="hover:text-primary-700" href="/">Pelajar</a>
      {onTrainer ? (
        <a className="hover:text-primary-700" href="/trainer">Tenaga Pengajar</a>
      ) : null}
    </nav>
  );
}


