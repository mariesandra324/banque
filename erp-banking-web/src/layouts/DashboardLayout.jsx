import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Siderbar";

import "../styles/layout.css";

function DashboardLayout() {
    const [open, setOpen] = useState(true);
    const location = useLocation();

    // Sur mobile/tablette, on ferme automatiquement le tiroir
    // de navigation quand l'utilisateur change de page.
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="layout">
            {/* Navbar */}
            <Navbar toggleSidebar={() => setOpen(!open)} />

            {/* Corps */}
            <div className="layout-body">

                {/* Voile sombre derrière le menu (mode mobile) */}
                <div
                    className={`sidebar-layer ${open ? "open" : ""}`}
                    onClick={() => setOpen(false)}
                />

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