import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Landmark } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/login.css";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            await login({
                email,
                motDePasse
            });

            navigate("/dashboard");

        // eslint-disable-next-line no-unused-vars
        } catch (error) {

            alert("Email ou mot de passe incorrect.");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <Landmark size={55} />

                    <h1>ERP Banking</h1>

                    <p>Connectez-vous à votre espace sécurisé</p>

                </div>

                <form onSubmit={handleLogin}>

                    <div className="input-group">

                        <Mail size={20} />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <Lock size={20}/>

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mot de passe"
                            value={motDePasse}
                            onChange={(e)=>setMotDePasse(e.target.value)}
                            required
                        />

                        <span
                            className="password-toggle"
                            onClick={()=>setShowPassword(!showPassword)}
                        >

                            {
                                showPassword
                                ? <EyeOff size={20}/>
                                : <Eye size={20}/>
                            }

                        </span>

                    </div>

                    <button
                        className="login-btn"
                        disabled={loading}
                    >

                        {
                            loading
                            ? "Connexion..."
                            : "Se connecter"
                        }

                    </button>

                </form>

            </div>

        </div>

    );

}

export default Login;