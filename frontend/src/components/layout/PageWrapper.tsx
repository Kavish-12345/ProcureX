import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function PageWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-white text-black">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="scrollbar-hidden flex-1 overflow-y-auto px-8 py-6">{children}</main>
            </div>
        </div>
    );
}