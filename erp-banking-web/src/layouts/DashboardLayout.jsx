import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Siderbar";

import "../styles/layout.css";

function DashboardLayout() {
    const [open, setOpen] = useState(true);

    return (
        <div className="layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar toggleSidebar={() => setOpen(!open)} />

            <div className="layout-body" style={{ display: "flex", flex: 1, position: "relative" }}>
                {open && <Sidebar />}

                <main 
                    className={`main-content ${open ? "sidebar-open" : ""}`}
                    style={{
                        flex: 1,
                        // AJUSTEMENT CRUCIAL : Si la Sidebar est ouverte, on pousse tout le contenu de 260px vers la droite
                        marginLeft: open ? "260px" : "0px", 
                        padding: "40px 24px",
                        display: "flex",
                        justifyContent: "center", // Centre le contenu restant disponible à l'écran
                        backgroundColor: "#f8fafc",
                        transition: "margin-left 0.3s ease", // Animation fluide à l'ouverture/fermeture
                        minHeight: "calc(100vh - 64px)", // Ajuste selon la hauteur de ta Navbar
                        boxSizing: "border-box"
                    }}
                >
                    {/* Ce bloc interne garantit que le tableau ne s'étale pas trop sur grand écran */}
                    <div style={{ width: "100%", maxWidth: "1200px" }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;