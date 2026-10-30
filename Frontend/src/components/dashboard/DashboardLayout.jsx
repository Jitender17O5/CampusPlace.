
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const DashboardLayout = ({ role }) => {
  return (
    <div
      className="d-flex"
      style={{
        height: "100vh",
        overflow: "hidden"
      }}
    >

      {/* Left Sidebar */}
      <DashboardSidebar role={role} />

      {/* Right Section */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          minWidth: 0,
          minHeight: 0
        }}
      >

        {/* Fixed Topbar */}
        <div style={{ flexShrink: 0 }}>
          <Topbar role={role} />
        </div>

        {/* Scrollable Content */}
        <main
          className="flex-grow-1 p-4 bg-light"
          style={{
            overflowY: "auto",
            minHeight: 0,
            backgroundColor: "#f4f6fc"
          }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
};
