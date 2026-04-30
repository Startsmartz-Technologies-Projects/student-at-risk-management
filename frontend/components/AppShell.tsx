import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  headerLeftBadge?: React.ReactNode;
}

export default function AppShell({
  children,
  searchPlaceholder,
  headerLeftBadge,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header
          searchPlaceholder={searchPlaceholder}
          leftBadge={headerLeftBadge}
        />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
