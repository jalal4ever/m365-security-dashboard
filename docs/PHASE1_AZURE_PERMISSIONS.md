# Azure AD Permissions Requises - Phase 1

## Vue d'ensemble

Pour implémenter la vue DSI "Single Pane of Glass", les permissions Azure AD suivantes doivent être ajoutées à l'app registration.

## Permissions Graph API Existantes (à conserver)

### Permissions déjà utilisées
- `SecureScores.Read.All` - Secure Score
- `DeviceManagementManagedDevices.Read.All` - Device Compliance
- `Directory.Read.All` - Admin Roles

## Nouvelles Permissions Requises

### 1. Identity Protection (Comptes à Risque)

**Application Permissions:**
```
IdentityRiskEvent.Read.All
IdentityRiskyUser.Read.All
```

**Description:** Permet de lire les utilisateurs à risque et l'historique des événements de risque.

**API:** `https://graph.microsoft.com/v1.0/identityProtection/riskyUsers`

---

### 2. Microsoft Defender for Endpoint/Cloud (Alertes XDR)

**Application Permissions:**
```
Alert.Read.All
SecurityAlert.Read.All
Incident.Read.All
```

**Description:** Permet de lire les alertes et incidents de sécurité Microsoft Defender.

**API:** 
- `https://graph.microsoft.com/v1.0/security/alerts`
- `https://graph.microsoft.com/v1.0/security/incidents`

---

### 3. Security Recommendations (Actions de Remédiation)

**Application Permissions:**
```
SecurityRecommendation.Read.All
SecurityActions.Read.All
```

**Description:** Permet de lire les recommandations de sécurité et les actions de remédiation.

**API:**
- `https://graph.microsoft.com/v1.0/security/recommendations`
- `https://graph.microsoft.com/v1.0/security/actions`

---

### 4. Threat Intelligence

**Application Permissions:**
```
SecurityIndicator.Read.All
```

**Description:** Permet de lire les indicateurs de menace (TI).

**API:** `https://graph.microsoft.com/v1.0/security/tiIndicators`

---

### 5. DLP (Data Loss Prevention)

**Application Permissions:**
```
DataLossPreventionPreventionEvaluation.Read.All
DataLossPreventionPolicy.Evaluate
```

**Description:** Permet de lire les alertes DLP Microsoft Purview.

**API:** `https://graph.microsoft.com/v1.0/security/dataLossPrevention/alerts`

---

### 6. Cloud App Discovery (Shadow IT)

**Application Permissions:**
```
CloudApp.Read.All
```

**Description:** Permet de découvrir les applications cloud non autorisées (Shadow IT).

**API:** `https://graph.microsoft.com/v1.0/security/cloudAppDiscovery`

---

## Instructions d'ajout

1. Ouvrir le [Azure Portal](https://portal.azure.com)
2. Aller dans **Azure Active Directory** > **App registrations**
3. Sélectionner votre application
4. Cliquer sur **API permissions**
5. Cliquer sur **Add a permission**
6. Sélectionner **Microsoft Graph** > **Application permissions**
7. Ajouter les permissions listées ci-dessus
8. Cliquer sur **Grant admin consent** (requis pour les application permissions)

## Permissions totals attendues après activation

```json
{
  "IdentityRiskEvent.Read.All": "Identity Protection",
  "IdentityRiskyUser.Read.All": "Identity Protection",
  "Alert.Read.All": "Defender",
  "SecurityAlert.Read.All": "Defender",
  "Incident.Read.All": "Defender",
  "SecurityRecommendation.Read.All": "Security",
  "SecurityActions.Read.All": "Security",
  "SecurityIndicator.Read.All": "Security",
  "DataLossPreventionPreventionEvaluation.Read.All": "Compliance",
  "DataLossPreventionPolicy.Evaluate": "Compliance",
  "CloudApp.Read.All": "Cloud Discovery"
}
```

## Notes

- Les permissions de type **Application** (vs Delegated) sont préférées pour un backend service
- Après ajout des permissions, le consentement admin est obligatoire
- Certaines APIs peuvent retourner 404 si les services相应ants ne sont pas souscrits (ex: Defender for Cloud Apps)
