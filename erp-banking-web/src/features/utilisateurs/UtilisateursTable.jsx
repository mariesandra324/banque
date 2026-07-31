function UtilisateurTable({

    utilisateurs,
    onEdit,
    onDelete

}){

    return(

        <table>

            <thead>

                <tr>

                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Action</th>

                </tr>

            </thead>

            <tbody>

                {

                    utilisateurs.map(user=>(

                        <tr key={user.id}>

                            <td>{user.nom}</td>

                            <td>{user.prenom}</td>

                            <td>{user.email}</td>

                            <td>{user.role.nom}</td>

                            <td>

                                {

                                    user.actif ?

                                    "Actif"

                                    :

                                    "Inactif"

                                }

                            </td>

                            <td>

                                <button
                                    onClick={()=>onEdit(user)}
                                >
                                    Modifier
                                </button>

                                <button
                                    onClick={()=>onDelete(user.id)}
                                >
                                    Supprimer
                                </button>

                            </td>

                        </tr>

                    ))

                }

            </tbody>

        </table>

    )

}

export default UtilisateurTable;