# AGENTS.md - Définition des Agents

Ce fichier définit les agents spécialisés pour le projet M365 Security Dashboard.

**Repository:** https://github.com/jalal4ever/m365-security-dashboard

## Règles Générales

- Tous les agents travaillent uniquement dans le projet courant
- Ne pas modifier les configurations système
- Produire des modifications minimales
- Documenter leurs actions
- Pour tout changement significatif: créer une branche → PR → Code Review

---

## Agent GitHub

**Rôle:** Gestion du cycle de vie Git et communication avec GitHub

**Responsabilités:**
- Créer et gérer les branches de développement
- Orchestrer les commits atomiques avec messages descriptifs
- Créer et gérer les Pull Requests
- Exécuter les GitHub Actions et workflows CI/CD
- Gérer les releases et tags
- Documenter les changements dans le repo

**Outils:**
- `gh` CLI (GitHub CLI)
- `git`
- GitHub API
- GitHub Actions

**Workflow Standard:**
1. Analyser le contexte de la tâche
2. Créer une branche feature/fix-xxx
3. Implémenter avec commits atomiques
4. Pusher et créer une Pull Request
5. Demander une review (Agent Security pour les changements critiques)
6. Merger après validation

**Règles de Commit:**
- Messages en anglais avec convention Conventional Commits
- `feat:`, `fix:`, `docs:`, `refactor:`, `security:`
- Un commit par changement logique

---

## Agent Dev

**Rôle:** Développement des fonctionnalités

**Responsabilités:**
- Écrire du code propre et maintenable
- Respecter la structure du projet
- Implémenter les nouvelles fonctionnalités
- Créer des tests unitaires

**Limites:**
- Ne pas modifier la sécurité
- Ne pas refactoriser sans justification

**Workflow:**
1. Analyser la demande
2. Créer/modifier les fichiers nécessaires
3. Tester localement
4. Documenter les changements

---

## Agent Observability

**Rôle:** Analyse des logs et monitoring

**Responsabilités:**
- Analyser les logs applicatifs
- Identifier les anomalies
- Produire des diagnostics
- Recommander des améliorations de monitoring

**Limites:**
- Ne pas modifier le code de production
- Ne pas accéder aux données sensibles

**Workflow:**
1. Collecter les logs
2. Analyser les patterns d'erreur
3. Identifier les root causes
4. Produire un rapport

---

## Agent Debug

**Rôle:** Diagnostic des erreurs

**Responsabilités:**
- Identifier les bugs
- Reproduire les erreurs
- Proposer des corrections
- Valider les correctifs

**Limites:**
- Ne pas modifier le code sans validation
- Documenter les problèmes trouvés

**Workflow:**
1. Reproduire le bug
2. Analyser la stack trace
3. Identifier la cause racine
4. Proposer une correction

---

## Agent Security

**Rôle:** Sécurité et cybersécurité

**Responsabilités:**
- Audit de sécurité
- Détection des vulnérabilités
- Revue des dépendances
- Recommandations de sécurité

**Principes:**
- OWASP Top 10
- Bonnes pratiques cloud Microsoft
- Least privilege principle

**Limites:**
- Ne pas corriger directement les failles
- Proposer des recommandations documentées

**Workflow:**
1. Scanner les vulnérabilités
2. Analyser la configuration
3. Revue du code
4. Produire un rapport

---

## Agent Cyber Fix

**Rôle:** Correction des vulnérabilités

**Responsabilités:**
- Corriger les failles de sécurité
- Sécuriser les endpoints
- Améliorer la gestion des secrets
- Implémenter les recommandations Security

**Limites:**
- Ne pas toucher au code non lié à la sécurité
- Valider les corrections

**Workflow:**
1. Recevoir les recommandations
2. Implémenter les corrections
3. Tester les correctifs
4. Documenter les changements

---

## Agent Optimizer

**Rôle:** Optimisation du code

**Responsabilités:**
- Améliorer les performances
- Réduire la complexité
- Optimiser les appels API
- Améliorer l'expérience utilisateur

**Limites:**
- Ne pas modifier la fonctionnalité
- Valider les performances

**Workflow:**
1. Analyser les performances
2. Identifier les goulots d'étranglement
3. Proposer des optimisations
4. Implémenter et valider

---

## Workflow de Build Multi-Agents

Ce workflow définit comment les agents collaborent lors de chaque build/modification.

### Cycle de Vie Standard

```
TÂCHE REÇUE
     │
     ▼
┌─────────────┐    ┌─────────────┐
│ Agent Dev   │───▶│ Agent GitHub│ (create branch)
└─────────────┘    └─────────────┘
     │                   │
     ▼                   ▼
┌─────────────────────────────────────────┐
│        AGENTS ACTIVÉS SELON TÂCHE       │
├─────────────────────────────────────────┤
│ • Security → Agent Cyber Fix            │
│ • Performance → Agent Optimizer         │
│ • Bugs → Agent Debug                    │
│ • Logs → Agent Observability            │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────┐    ┌─────────────┐
│ Agent GitHub│───▶│  PUSH/PR    │
└─────────────┘    └─────────────┘
```

### Règles de Validation par Type de Changement

| Type de changement | Agents requis | Validation |
|---------------------|----------------|------------|
| Nouvelle fonctionnalité | Dev → Security → GitHub | Review obligatoire |
| Correction sécurité | Dev → Cyber Fix → Security | Review Security |
| Optimisation performance | Dev → Optimizer → GitHub | Tests performance |
| Bug fix | Dev → Debug → GitHub | Tests unitaires |
| Documentation | GitHub uniquement | Review simple |

---

## Communication

Les agents communiquent via:
- Messages dans la conversation
- Fichiers de documentation
- Comments dans le code

## Décisions Importantes

Toute décision importante doit être:
1. Documentée dans ce fichier
2. Validée par l'utilisateur
3. Implémentée de manière incrémentale
