import { useEffect, useState } from "react";
import {
    getUtilisateurs,
    deleteUtilisateur,
} from "../service/utilisateursService";

import UtilisateurTable from "../features/utilisateurs/UtilisateursTable";
import UtilisateurModal from "../features/utilisateurs/UtilisateurModal";
import "../styles/Utilisateurs.css"

function Utilisateurs() {

    const [utilisateurs, setUtilisateurs] = useState([]);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const charger = () => {
    getUtilisateurs()
        .then((res) => {
            console.log(res.data);
            setUtilisateurs(res.data.data);
        })
        .catch(console.error);
    };

    useEffect(() => {
        charger();
    }, []);

    const supprimer = (id) => {

        if(window.confirm("Supprimer ?")){

            deleteUtilisateur(id)
                .then(charger);

        }

    }
    

    return (

        <div className="container">

            <div className="header">

                <h2>Gestion Utilisateurs</h2>

                <button
                    onClick={()=>{
                        setSelected(null);
                        setOpen(true);
                    }}
                >
                    Ajouter
                </button>

            </div>

            <UtilisateurTable

                utilisateurs={utilisateurs}

                onEdit={(u)=>{
                    setSelected(u);
                    setOpen(true);
                }}

                onDelete={supprimer}

            />

            {
                open &&

                <UtilisateurModal

                    utilisateur={selected}

                    onClose={()=>{
                        setOpen(false);
                        charger();
                    }}

                />

            }

        </div>

    );

}

export default Utilisateurs;