
# Configuration du Backend FastAPI et Intégration React

## 1. Préparation de l'Environnement Python

Assurez-vous d'avoir Python installé.

### Commandes pour installer les dépendances :
```bash
pip install -r requirements.txt
```
Ou manuellement :
```bash
pip install fastapi "uvicorn[standard]" mysql-connector-python pydantic
```

## 2. Structure de l'API (main.py)

Le fichier `main.py` contient :
- **Connexion MySQL** : `host='localhost', user='root', password='oba2005lala!', database='boursagpt'`
- **CORS** : Configuré pour accepter les requêtes de `http://localhost:5173` (Vite).
- **Modèles Pydantic** : Validation des requêtes.

### Endpoints Disponibles :
1.  `POST /login` : Retourne `{id, full_name, role, risk_profile, capital}`
2.  `POST /update-profile` : Met à jour le profil de risque.
3.  `GET /portfolio/{user_id}` : Récupère les actifs de l'investisseur.
4.  `GET /alerts` : Récupère les alertes de fraude pour le régulateur.

## 3. Logique de Navigation & Rôles (React)

### Gestion du Login et Redirection

Dans votre composant de Login (ex: `LoginSelection.tsx` ou un formulaire dédié), une fois authentifié :

```tsx
// Exemple de fonction handleLoginSubmit
const handleLoginSubmit = async (email, password) => {
    const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const userData = await response.json();
        
        // Stocker l'utilisateur (Context ou localStorage)
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirection Conditionnelle
        if (userData.role === 'regulateur') {
            navigate('/dashboard?view=surveillance');
        } else if (userData.role === 'investisseur') {
            if (!userData.risk_profile) {
                navigate('/onboarding'); // Besoin de compléter le profil
            } else {
                navigate('/dashboard?view=portfolio');
            }
        }
    } else {
        alert("Echec de connexion");
    }
};
```

### Affichage Conditionnel dans le Dashboard

Modifiez `Dashboard.tsx` pour lire le rôle et afficher le bon composant.

```tsx
/* src/pages/Dashboard.tsx */
import { useEffect, useState } from 'react';
import PortfolioOverview from '../components/widgets/PortfolioOverview';
import SurveillanceAlerts from '../components/widgets/SurveillanceAlerts'; // Assurez-vous d'avoir ce composant

const Dashboard = () => {
    const [userRole, setUserRole] = useState<'investisseur' | 'regulateur' | null>(null);

    useEffect(() => {
        // Récupérer le rôle stocké
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserRole(parsedUser.role);
        }
    }, []);

    // Rendu basé sur le rôle
    return (
        <div className="dashboard-container">
            {/* ... Header, Sidebar ... */}
            
            <div className="content-area">
                {userRole === 'investisseur' ? (
                    <PortfolioOverview />
                ) : userRole === 'regulateur' ? (
                    <SurveillanceAlerts />
                ) : (
                    <p>Chargement ou Accès non autorisé...</p>
                )}
            </div>
        </div>
    );
};
```

## 4. Lancer le Serveur

Une fois les dépendances installées, lancez le serveur FastAPI avec la commande suivante :

```bash
uvicorn main:app --reload
```

Le serveur sera accessible sur `http://localhost:8000`.
- Documentation interactive (Swagger UI) disponible sur : `http://localhost:8000/docs`
