import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminBottomNav from "./AdminBottomNav";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zm-bg bg-noise flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto pb-16 lg:pb-0">
        <Outlet />
      </div>
      <AdminBottomNav />
    </div>
  );
}
