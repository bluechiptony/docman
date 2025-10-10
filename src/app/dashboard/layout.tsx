import Sidebar from "@/components/layout/sidebar";
import "../globals.css";
import TopBar from "@/components/layout/topbar";

export const metadata = {
  title: "Docman | Document Management System",
  description: "Manage, organize, and access documents efficiently.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex row h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopBar />
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
