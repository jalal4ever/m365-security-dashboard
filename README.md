# M365 Security Dashboard

Dashboard de supervision de la sécurité Microsoft 365.

## Fonctionnalités

- **Secure Score** - Suivi du score de sécurité Microsoft
- **Administrateurs** - Surveillance des rôles d'administration
- **Licences** - Utilisation des licences Microsoft 365
- **MFA** - Audit de l'authentification multifacteur

## Prérequis

- Docker
- Docker Compose
- Azure App Registration avec permissions Microsoft Graph

## Configuration Azure AD

1. Créer une App Registration dans Azure AD
2. Ajouter les permissions API suivantes:
   - `SecurityEvents.Read.All`
   - `Directory.Read.All`
   - `User.Read.All`
   - `Organization.Read.All`
3. Générer un Client Secret
4. Copier `.env.example` vers `.env` et configurer les variables

## Installation

```bash
# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs Azure

# Lancer les conteneurs
docker-compose up -d
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | Dashboard React |
| Backend | 8000 | API FastAPI |
| PostgreSQL | 5432 | Base de données |

## URLs

- Frontend: http://localhost:5173
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Architecture

```
m365-security-dashboard/
├── backend/          # API FastAPI
├── frontend/         # Dashboard React
├── docker/          # Configuration Docker
└── .env             # Variables d'environnement
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
