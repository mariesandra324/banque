import { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import { Outlet } from "react-router-dom";

function Layout(){

    const [open,setOpen]=useState(true);

    return(

        <>

            <Navbar
                toggleSidebar={()=>setOpen(!open)}
            />

            <div className="container">

                {open && <Sidebar/>}

                <main className="content">

                    <Outlet/>

                </main>

            </div>

        </>

    );

}

export default Layout;