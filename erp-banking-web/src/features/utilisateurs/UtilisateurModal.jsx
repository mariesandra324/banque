/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import api from "../../service/api";

import {
    createUtilisateur,
    updateUtilisateur
} from "../../service/utilisateursService";

function UtilisateurModal({

    utilisateur,
    onClose

}){

    const [roles,setRoles]=useState([]);

    const [form,setForm]=useState({

        nom:"",
        prenom:"",
        email:"",
        telephone:"",
        motDePasse:"",
        roleId:""

    });

    useEffect(() => {

        api.get("/roles")
            .then(res => setRoles(res.data));

        if (utilisateur) {

            setForm({
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                telephone: utilisateur.telephone,
                motDePasse: "",
                roleId: utilisateur.role.id
            });

        }

    }, []);

    const change=(e)=>{

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    }

    const submit=(e)=>{

        e.preventDefault();

        if(utilisateur){

            updateUtilisateur(utilisateur.id,form)

                .then(onClose);

        }else{

            createUtilisateur(form)

                .then(onClose);

        }

    }

    return(

        <div className="modal">

            <form onSubmit={submit}>

                <h3>

                    {

                        utilisateur ?

                        "Modifier"

                        :

                        "Ajouter"

                    }

                </h3>

                <input

                    name="nom"

                    placeholder="Nom"

                    value={form.nom}

                    onChange={change}

                />

                <input

                    name="prenom"

                    placeholder="Prénom"

                    value={form.prenom}

                    onChange={change}

                />

                <input

                    name="email"

                    placeholder="Email"

                    value={form.email}

                    onChange={change}

                />

                <input

                    name="telephone"

                    placeholder="Téléphone"

                    value={form.telephone}

                    onChange={change}

                />

                {

                    !utilisateur &&

                    <input

                        type="password"

                        name="motDePasse"

                        placeholder="Mot de passe"

                        value={form.motDePasse}

                        onChange={change}

                    />

                }

                <select

                    name="roleId"

                    value={form.roleId}

                    onChange={change}

                >

                    <option value="">Choisir un rôle</option>

                    {

                        roles.map(role=>(

                            <option

                                key={role.id}

                                value={role.id}

                            >

                                {role.nom}

                            </option>

                        ))

                    }

                </select>

                <button>

                    Enregistrer

                </button>

                <button
                    type="button"
                    onClick={onClose}
                >
                    Annuler
                </button>

            </form>

        </div>

    )

}

export default UtilisateurModal;