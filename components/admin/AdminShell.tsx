import Sidebar from "@/components/admin/Sidebar";

export default function AdminShell({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Page header */}
        <div className="px-8 py-6 border-b border-gray-800 bg-gray-900">
          <h1 className="text-xl font-black text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {/* Page content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
