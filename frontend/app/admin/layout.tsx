"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { PageLoader } from "@/components/ui/Spinner";
import { useRequireAdmin } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireAdmin();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}