'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '@/components/layout/Sidebar';
import { ACTIVE_SAMPLE_USER_ID, SAMPLE_USERS } from '@/data/sampledata';
import { SIDEBAR_ITEMS_BY_ROLE } from '@/lib/constants/sidebar';
import type { UserRole } from '@/lib/constants/header';

interface DashboardShellProps {
  children: ReactNode;
  role?: UserRole;
}

export default function DashboardShell({ children, role }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeUser = useMemo(
    () => SAMPLE_USERS.find((user) => user.id === ACTIVE_SAMPLE_USER_ID) || null,
    []
  );
  const resolvedRole = role ?? activeUser?.role ?? 'guest';
  const hasSidebar = (SIDEBAR_ITEMS_BY_ROLE[resolvedRole] ?? []).length > 0;

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <div className="mx-auto h-full w-full py-6">
        {hasSidebar && (
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              aria-label="Open sidebar"
            >
              <MenuIcon sx={{ fontSize: 20 }} />
              Menu
            </button>
            <span className="text-sm text-gray-500">{resolvedRole.toUpperCase()}</span>
          </div>
        )}

        <div className="relative w-full h-full lg:flex lg:gap-6">
          {hasSidebar && (
            <>
              {isSidebarOpen && (
                <button
                  type="button"
                  className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar overlay"
                />
              )}
              <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                role={resolvedRole}
              />
            </>
          )}

          <main className="min-w-0 flex-1 h-full overflow-y-auto rounded-xl bg-white p-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
