# M365 Security Dashboard

Dashboard de supervision de la sécurité Microsoft 365.

**Repository:** https://github.com/jalal4ever/m365-security-dashboard

## Fonctionnalités

- **Secure Score** - Suivi du score de sécurité Microsoft
- **Administrateurs** - Surveillance des rôles d'administration
- **Licences** - Vue détaillée de l'utilisation des licences Business Premium
- **MFA** - Audit MFA basé sur `authenticationMethods/userRegistrationDetails` + liste des comptes sans méthode
- **Appareils** - Visibilité par OS/version et état de conformité Intune (doughnut, jauges et liste)
- **Configuration Azure** - Interface web pour configurer les credentials Azure

## Prérequis

- Docker
- Docker Compose
- Azure App Registration avec permissions Microsoft Graph
- Permissions additionnelles pour MFA et rapports:
  - `AuditLog.Read.All` (requise pour `reports/authenticationMethods/userRegistrationDetails`)
  - `Reports.Read.All`

## Configuration Azure AD (Option 1 - Fichier .env)

1. Créer une App Registration dans Azure AD
2. Ajouter les permissions API suivantes:
   - `SecurityEvents.Read.All`
   - `Directory.Read.All`
   - `User.Read.All`
   - `Organization.Read.All`
   - `AuditLog.Read.All` (pour les rapports d'inscription MFA)
   - `Reports.Read.All`
3. Générer un Client Secret
4. Copier `.env.example` vers `.env` et configurer les variables

## Configuration Azure AD (Option 2 - Interface Web)

Après avoir lancé l'application:
1. Accéder à http://localhost:5170
2. Cliquer sur l'icône Settings (en haut à droite)
3. Entrer le Nom de l'entreprise, Tenant ID, Client ID et Client Secret
4. Cliquer sur "Tester la connexion" pour vérifier (obligatoire)
5. Une fois le test réussi, cliquer sur "Enregistrer"

Les credentials sont chiffrés (AES-256 + bcrypt) avant stockage en base de données.

### Options de configuration

- **Nom de l'entreprise** : Nom d'affichage dans le header du dashboard
- **Définir par défaut** : Marque cette configuration comme celle par défaut

## Installation

```bash
# Lancer les conteneurs
docker-compose -f docker/docker-compose.yml up -d
```

## Services

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5170 | http://localhost:5170 |
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |

## MFA Coverage

- **Source**: `reports/authenticationMethods/userRegistrationDetails` (permet de détecter _isMfaCapable_ / _isMfaRegistered_ sans dépendre uniquement des méthodes enregistrées).
- **Filtrage**: seuls les `userType=Member` avec un UPN `@entis.onmicrosoft.com` sont pris en compte (exclusion des invités, contacts, `#EXT#`, comptes services).
- **Objectif**: cette couche présente un inventaire fiable des comptes capables de faire MFA et met en avant les comptes non conformes via le widget MFA.

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
