# M365 Security Dashboard

Dashboard de supervision de la sécurité Microsoft 365.

**Repository:** https://github.com/jalal4ever/m365-security-dashboard

## Fonctionnalités

- **Secure Score** - Suivi du score de sécurité Microsoft
- **Administrateurs** - Surveillance des rôles d'administration
- **Licences** - Utilisation des licences Microsoft 365
- **MFA** - Audit de l'authentification multifacteur
- **Configuration Azure** - Interface web pour configurer les credentials Azure

## Prérequis

- Docker
- Docker Compose
- Azure App Registration avec permissions Microsoft Graph

## Configuration Azure AD (Option 1 - Fichier .env)

1. Créer une App Registration dans Azure AD
2. Ajouter les permissions API suivantes:
   - `SecurityEvents.Read.All`
   - `Directory.Read.All`
   - `User.Read.All`
   - `Organization.Read.All`
3. Générer un Client Secret
4. Copier `.env.example` vers `.env` et configurer les variables

## Configuration Azure AD (Option 2 - Interface Web)

Après avoir lancé l'application:
1. Accéder à http://localhost:5173
2. Cliquer sur l'icône Settings (en haut à droite)
3. Entrer le Tenant ID, Client ID et Client Secret
4. Cliquer sur "Test Connection" pour vérifier
5. Cliquer sur "Save Configuration"

Les credentials sont chiffrés (AES-256) avant stockage en base de données.

## Installation

```bash
# Lancer les conteneurs
docker-compose -f docker/docker-compose.yml up -d
```

## Intégration GitHub

L'application peut communiquer avec l'API GitHub pour gérer les repositories, pull requests et workflows.

### Configuration

1. Créer un Personal Access Token sur GitHub:
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Cocher les permissions: `repo`, `workflow`, `read:user`

2. Configurer via l'interface:
   - Aller dans Settings → onglet GitHub
   - Entrer le token
   - Cliquer "Test Connection"

### Sécurité

- Le token est stocké localement dans le navigateur (localStorage)
- Pour une utilisation serveur, définir `GITHUB_TOKEN` dans les variables d'environnement
- Les logs ne contiennent jamais le token en clair

### API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/github/status` | Vérifier configuration |
| GET | `/api/github/user` | Obtenir info utilisateur |
| GET | `/api/github/repos` | Lister les repositories |
| POST | `/api/github/repos` | Créer un repository |
| POST | `/api/github/repos/{owner}/{repo}/pulls` | Créer une PR |
| GET | `/api/github/repos/{owner}/{repo}/pulls` | Lister les PRs |
| GET | `/api/github/repos/{owner}/{repo}/actions` | Voir les workflows |

### Logging

Les opérations GitHub sont journalisées avec:
- Timestamp
- Type d'opération
- Résultat (success/failed)
- Détails de l'erreur en cas d'échec

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |

## CI/CD GitHub Actions

Le projet utilise GitHub Actions pour la validation automatique:

- **Lint Backend** - Ruff + MyPy
- **Lint Frontend** - ESLint + TypeScript
- **Security Scan** - pip-audit + npm audit
- **Docker Build** - Construction et test des containers

## Architecture

```
m365-security-dashboard/
├── .github/workflows/   # CI/CD pipelines
├── backend/             # API FastAPI
│   ├── app/routers/    # API endpoints (incl. azure config)
│   └── services/       # Services (encryption, graph client)
├── frontend/            # Dashboard React
│   └── src/pages/      # Pages (Settings)
└── docker/             # Configuration Docker
```

## Développement

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```
