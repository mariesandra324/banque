
import "../styles/dashboard.css";

function Dashboard(){

    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    return(

        <div className="dashboard">

            <div className="dashboard-header">

                <h1>Bienvenue 👋</h1>

                <p>{email}</p>

                <span>{role}</span>

            </div>

            <div className="dashboard-grid">

                

            </div>

        </div>

    );

}

export default Dashboard;