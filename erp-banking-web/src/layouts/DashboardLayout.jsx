import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Siderbar";

import "../styles/layout.css";

function DashboardLayout() {
    const [open, setOpen] = useState(true);

    return (
        <div className="layout">
            {/* Navbar */}
            <Navbar toggleSidebar={() => setOpen(!open)} />

            {/* Corps */}
            <div className="layout-body">

                {/* Sidebar */}
                {open && <Sidebar />}

                {/* Contenu principal */}
                <main className={`main-content ${open ? "sidebar-open" : ""}`}>
                    <div className="main-inner">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
}

export default DashboardLayout;