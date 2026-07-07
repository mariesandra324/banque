import { Routes, Route } from "react-router-dom";

import Login from "../features/auth/Login";
import ClientList from "../features/client/ClientList";


function AppRoutes(){

    return(
        <Routes>

            <Route 
                path="/login"
                element={<Login />}
            />


            <Route 
                path="/clients"
                element={<ClientList />}
            />


        </Routes>
    )

}

export default AppRoutes;