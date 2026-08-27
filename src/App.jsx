import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import RequireAdmin from "./components/RequireAdmin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Posts from "./pages/Posts";
import ForumModeration from "./pages/ForumModeration";
import CommentModeration from "./pages/CommentModeration";
import ChatModeration from "./pages/ChatModeration";
import AuditLog from "./pages/AuditLog";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/forum" element={<ForumModeration />} />
        <Route path="/comments" element={<CommentModeration />} />
        <Route path="/chat" element={<ChatModeration />} />
        <Route path="/audit-log" element={<AuditLog />} />
      </Route>
    </Routes>
  );
}
