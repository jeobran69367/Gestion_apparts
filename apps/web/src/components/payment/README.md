# Système de Paiement Multi-Méthodes

Ce dossier contient tous les composants pour gérer les différentes méthodes de paiement de l'application.

## Structure

```
components/payment/
├── PaymentMethodSelector.tsx    # Composant principal de sélection
├── CreditCardPayment.tsx       # Paiement par carte bancaire
├── PaypalPayment.tsx           # Paiement PayPal
├── MobileMoneyPayment.tsx      # Mobile Money (MTN, Moov, Wave)
├── OrangeMoneyPayment.tsx      # Orange Money spécialisé
├── MonetbilPayment.tsx         # Paiement Monetbil (BEAC certifié)
└── README.md                   # Ce fichier
```

## Méthodes de paiement supportées

### 1. Carte de crédit/débit (`CreditCardPayment.tsx`)
- **Cartes acceptées**: Visa, Mastercard, American Express
- **Fonctionnalités**:
  - Formatage automatique du numéro de carte
  - Détection automatique du type de carte
  - Validation en temps réel
  - Formatage de la date d'expiration (MM/YY)
  - Validation du CVV (3-4 chiffres)

### 2. PayPal (`PaypalPayment.tsx`)
- **Fonctionnalités**:
  - Redirection sécurisée vers PayPal
  - Saisie optionnelle de l'email pour accélérer le processus
  - Informations sur les avantages PayPal

### 3. Mobile Money (`MobileMoneyPayment.tsx`)
- **Opérateurs supportés**:
  - MTN Mobile Money (Cameroun, Ghana, Uganda, Rwanda)
  - Orange Money (Cameroun, Côte d'Ivoire, Mali, Sénégal)
  - Moov Money (Bénin, Burkina Faso, Côte d'Ivoire)
  - Wave (Sénégal, Côte d'Ivoire)
- **Fonctionnalités**:
  - Sélection de l'opérateur avec interface visuelle
  - Formatage automatique du numéro de téléphone
  - Instructions de paiement détaillées

### 4. Orange Money (`OrangeMoneyPayment.tsx`)
- **Pays supportés**: 17 pays africains
- **Fonctionnalités**:
  - Sélection du pays avec préfixes automatiques
  - Formatage spécifique par pays
  - Instructions USSD détaillées
  - Informations sur les frais

### 5. Monetbil (`MonetbilPayment.tsx`)
- **Certification**: Solution certifiée BEAC (Banque des États de l'Afrique Centrale)
- **Pays supportés**: Cameroun, Côte d'Ivoire, Sénégal, Gabon, Tchad et plus
- **Opérateurs supportés**: MTN, Orange, Airtel, Moov, Tigo, Expresso, Camtel, Libertis
- **Fonctionnalités**:
  - API sécurisée côté serveur
  - Webhooks automatiques pour les notifications
  - Redirection sécurisée vers la plateforme Monetbil
  - Support du Franc CFA (XAF)
  - Vérification de statut en temps réel
  - Pages de succès/échec personnalisées

## Utilisation

### Intégration dans une page

```tsx
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';

function BookingPage() {
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'CREDIT_CARD',
    // autres propriétés...
  });

  const handlePaymentChange = (section: string, field: string, value: string) => {
    // Logique de mise à jour
  };

  return (
    <PaymentMethodSelector
      paymentInfo={paymentInfo}
      onInputChange={handlePaymentChange}
    />
  );
}
```

### Structure des données de paiement

```tsx
interface PaymentInfo {
  method: 'CREDIT_CARD' | 'PAYPAL' | 'MOBILE_MONEY' | 'ORANGE_MONEY' | 'MONETBIL';
  
  // Carte de crédit
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  
  // PayPal
  email?: string;
  
  // Mobile Money
  phoneNumber?: string;
  provider?: string;
  
  // Orange Money
  country?: string;
  
  // Monetbil
  operator?: string;
}
```

## Validation

Chaque composant de paiement gère sa propre validation :

- **Carte de crédit**: Validation du format, de la date d'expiration, du CVV
- **PayPal**: Pas de validation côté client (gérée par PayPal)
- **Mobile Money**: Validation du numéro et sélection de l'opérateur
- **Orange Money**: Validation du numéro et sélection du pays
- **Monetbil**: Validation du numéro, pays et opérateur obligatoires

## Sécurité

- Toutes les données sensibles sont chiffrées en transit
- Aucune information de carte n'est stockée côté client
- Utilisation de tokens sécurisés pour les paiements
- Conformité PCI DSS pour les cartes bancaires
- **Monetbil**: API sécurisée côté serveur, webhooks signés, certification BEAC

## Configuration Monetbil

Pour utiliser Monetbil, configurez les variables d'environnement :

```bash
# .env.local
MONETBIL_SERVICE_KEY=your_service_key
MONETBIL_SERVICE_SECRET=your_service_secret
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Endpoints API créés

- `/api/monetbil/payment` (POST/GET) - Initialiser et vérifier les paiements
- `/api/monetbil/webhook` (POST/GET) - Recevoir les notifications Monetbil

### Pages de redirection

- `/booking/success` - Page de confirmation de paiement
- `/booking/cancel` - Page d'annulation de paiement

## Personnalisation

### Ajouter une nouvelle méthode de paiement

1. Créer un nouveau composant dans `components/payment/`
2. Ajouter la méthode dans `PaymentMethodSelector.tsx`
3. Mettre à jour l'interface `PaymentInfo`
4. Ajouter la validation correspondante

### Modifier les styles

Les composants utilisent Tailwind CSS et peuvent être facilement personnalisés en modifiant les classes CSS.

## Support

Ce système supporte particulièrement les paiements mobiles africains, avec une attention spéciale pour :
- Les formats de numéros de téléphone locaux
- Les instructions USSD spécifiques à chaque opérateur
- Les devises et frais locaux
- L'interface multilingue (français principalement)

## Développement futur

- Intégration avec des API de paiement réelles (Stripe, PayPal API, etc.)
- Support de plus d'opérateurs mobiles
- Gestion des devises multiples
- Historique des transactions
- Remboursements automatiques
