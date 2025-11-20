// components/PawaPayPayment.tsx
import React, { useState, useEffect } from 'react';

interface PawaPayPaymentProps {
    paymentInfo: any;
    onInputChange: (section: string, field: string, value: string) => void;
    amount: number;
    onPaymentSuccess?: (paymentData: any) => void;
    onPaymentError?: (error: string) => void;
    onPaymentStatusChange?: (status: string) => void;
}

const getPawaPayCountryCode = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('237')) return 'CMR';
    if (cleaned.startsWith('225')) return 'CIV';
    if (cleaned.startsWith('221')) return 'SEN';
    return 'OTHER';
};


const PawaPayPayment: React.FC<PawaPayPaymentProps> = ({
    paymentInfo,
    onInputChange,
    amount, 
    onPaymentSuccess,
    onPaymentError,
    onPaymentStatusChange
}) => {
    const [currency] = useState('XAF');
    const [phoneNumber, setPhoneNumber] = useState(paymentInfo?.phoneNumber || '');
    const [provider, setProvider] = useState(paymentInfo?.provider || '');
    const [isProcessing, setIsProcessing] = useState(false);
    console.log('Montant reçu (prop amount):', amount);
    const [status, setStatus] = useState<string | null>(null);
    
    // 🟢 CORRECTION: Initialiser displayAmount avec la prop amount. 
    // Si amount est la source de vérité et ne change pas de manière imprévue, c'est suffisant.
    const [displayAmount, setDisplayAmount] = useState<number>(amount || 0); 
    
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [currentDepositId, setCurrentDepositId] = useState<string | null>(null);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    // ⚠️ Mettre à jour displayAmount si la prop 'amount' change dans le composant parent.
    // Cette étape est CRUCIALE si le montant peut changer dynamiquement après le montage.
    useEffect(() => {
        setDisplayAmount(amount || 0);
    }, [amount]);


    // Nettoyer l'intervalle de polling à la destruction du composant
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);


    const providers = [
        { value: 'ORANGE_CMR', label: 'Orange Money Cameroun' },
        { value: 'MTN_MOMO_CMR', label: 'MTN Mobile Money Cameroun' },
    ];

    const cleanPhoneNumberForPawaPay = (phone: string): string => {
        // ⚠️ SUPPRIMER TOUT sauf les chiffres - PAS de '+', PAS d'espaces
        const cleaned = phone.replace(/\D/g, '');

        return cleaned;
    };

    // MODIFIER la validation :
    const validateInternationalFormat = (phone: string): boolean => {
        const cleaned = cleanPhoneNumberForPawaPay(phone);
        // Format: 237699123456 (11-12 chiffres pour Cameroun)
        return cleaned.length >= 9 && cleaned.length <= 15;
    };

    // Dans PawaPayPayment.tsx - modifier la fonction checkPaymentStatus
    const checkPaymentStatus = async (depositId: string): Promise<boolean> => {

        
        try {
            console.log('🔍 Vérification statut pour:', depositId);
            const response = await fetch(`/api/pawapay/check-deposit?depositId=${depositId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setStatus('NOT_FOUND');
                    return false;
                }
                throw new Error(`Erreur ${response.status} lors de la vérification`);
            }

            const data = await response.json();

            // ⚠️ CORRECTION : Maintenant data contient directement les infos du dépôt
            const pawaPayStatus = data.status; // "COMPLETED", "PENDING", etc.
            setStatus(pawaPayStatus);
            onPaymentStatusChange?.(pawaPayStatus);

            console.log('📊 Statut PawaPay reçu:', {
                depositStatus: pawaPayStatus,
                hasData: data.hasData,
                fullData: data
            });

            // Statuts finaux qui arrêtent le polling
            const finalStatuses = ['COMPLETED', 'FAILED', 'REJECTED', 'EXPIRED', 'CANCELLED'];

            if (finalStatuses.includes(pawaPayStatus)) {
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                }

                // Déplacement du log pour s'assurer que toutes les variables sont définies
                if (pawaPayStatus === 'COMPLETED') {
                    console.log('✅ Appel à onPaymentSuccess avec les données:', {
                        depositId,
                        amount: displayAmount,
                        currency,
                        provider,
                        phoneNumber,
                        ...data
                    });
                    onPaymentSuccess?.({
                        ...data,
                        depositId,
                        amount: displayAmount,
                        currency,
                        provider,
                        phoneNumber: phoneNumber
                    });
                    return true;
                } else {
                    const errorMessage = data.failureReason?.failureMessage ||
                        data.message ||
                        `Paiement ${pawaPayStatus}`;
                    onPaymentError?.(errorMessage);
                    return false;
                }
            }

            return false;

        } catch (error) {
            console.error('Erreur vérification statut:', error);
            return false;
        }
    };

    // Démarrer le polling pour vérifier le statut
    const startPaymentPolling = (depositId: string) => {
        // Vérifier immédiatement
        checkPaymentStatus(depositId);

        // Démarrer l'intervalle de polling (toutes les 5 secondes)
        const interval = setInterval(() => {
            checkPaymentStatus(depositId);
        }, 5000);

        setPollingInterval(interval);

        // Arrêter après 5 minutes maximum
        setTimeout(() => {
            if (interval) {
                clearInterval(interval);
                setPollingInterval(null);
                if (status !== 'COMPLETED') {
                    onPaymentError?.('Délai de paiement dépassé. Veuillez réessayer.');
                    setStatus('EXPIRED');
                }
            }
        }, 300000); // 5 minutes
    };

    const initiatePayment = async () => {
        // Utilise la valeur la plus à jour de l'état local, qui est synchronisée avec la prop amount.
        const amountInMajorUnits = Math.round(displayAmount); 

        // Validation
        if (amountInMajorUnits <= 0 || isNaN(amountInMajorUnits)) {
            onPaymentError?.('Le montant à payer doit être un nombre entier positif.');
            return;
        }

        const cleanedPhone = cleanPhoneNumberForPawaPay(phoneNumber);
        if (!validateInternationalFormat(phoneNumber)) {
            onPaymentError?.('Le numéro de téléphone doit contenir entre 9 et 15 chiffres.');
            return;
        }

        if (!provider) {
            onPaymentError?.('Veuillez sélectionner un opérateur');
            return;
        }

        setIsProcessing(true);
        setStatus('INITIALISATION');
        setPaymentResult(null);
        onPaymentStatusChange?.('INITIALISATION');

        // Arrêter tout polling précédent
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }

        const depositId = crypto.randomUUID();
        setCurrentDepositId(depositId);

        // ⚠️ CORRECTION : Payload conforme à la documentation PawaPay
        const payload = {
            depositId,
            payer: {
                type: 'MMO',
                accountDetails: {
                    phoneNumber: cleanedPhone,
                    provider,
                },
            },
            preAuthorisationCode: null,
            clientReferenceId: `STUDIO-${Date.now()}`,
            customerMessage: "Réservation studio",
            amount: amountInMajorUnits.toString(), // Montant en unités principales (ex: FCFA)
            currency, 
            metadata: [
                {
                    orderId: `booking-${Date.now()}`,
                }
            ],
            country: getPawaPayCountryCode(cleanedPhone),   //  👈 AJOUT ESSENTIEL
        };


        try {
            const response = await fetch('/api/pawapay/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('Erreur parsing réponse:', parseError);
                throw new Error('Réponse invalide du serveur');
            }

            if (!response.ok) {
                const errorMessage = data.message || data.error || `Erreur ${response.status}`;
                console.error('Erreur serveur détaillée:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: data,
                });
                throw new Error(errorMessage);
            }

            setPaymentResult(data);

            // Mettre à jour les informations de paiement dans le parent
            onInputChange('paymentInfo', 'phoneNumber', phoneNumber);
            onInputChange('paymentInfo', 'provider', provider);
            onInputChange('paymentInfo', 'transactionId', depositId);
            onInputChange('paymentInfo', 'pawaPayReference', data.referenceId || '');
            onInputChange('paymentInfo', 'currency', currency);
            onInputChange('paymentInfo', 'amount', amountInMajorUnits.toString()); // Sauvegarde la valeur utilisée

            const initialStatus = data.status || 'PENDING';
            setStatus(initialStatus);
            onPaymentStatusChange?.(initialStatus);


            // Démarrer le polling si le statut n'est pas final
            if (['PENDING', 'ACCEPTED', 'INITIATED'].includes(initialStatus)) {
                startPaymentPolling(depositId);
            } else if (initialStatus === 'COMPLETED') {
                onPaymentSuccess?.({
                    ...data,
                    depositId,
                    amount: displayAmount,
                    currency,
                    provider,
                    phoneNumber: phoneNumber
                });
            } else {
                onPaymentError?.(data.message || initialStatus || 'Erreur inconnue');
            }

        } catch (error) {
            console.error('Échec initiation paiement PawaPay:', error);
            setStatus('FAILED');
            onPaymentStatusChange?.('FAILED');
            const errorMessage = error instanceof Error ? error.message : 'Erreur de réseau';
            onPaymentError?.(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        initiatePayment();
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneNumber(value);
        onInputChange('paymentInfo', 'phoneNumber', value);
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setProvider(value);
        onInputChange('paymentInfo', 'provider', value);
    };

    const formatFCFA = (amountValue: number) => {
        if (amountValue <= 0) return '0 FCFA';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amountValue) + ' FCFA';
    };

    const getCountryFromPhoneNumber = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('237')) return 'Cameroun';
        if (cleaned.startsWith('225')) return 'Côte d\'Ivoire';
        if (cleaned.startsWith('221')) return 'Sénégal';
        return 'Autre';
    };

    const filteredProviders = providers.filter(providerOption => {
        const country = getCountryFromPhoneNumber(phoneNumber);
        switch (country) {
            case 'Cameroun': return providerOption.value.includes('CMR');
            case 'Côte d\'Ivoire': return providerOption.value.includes('CIV');
            case 'Sénégal': return providerOption.value.includes('SEN');
            default: return true;
        }
    });

    const isPhoneValid = validateInternationalFormat(phoneNumber);
    const cleanedPhoneForDisplay = cleanPhoneNumberForPawaPay(phoneNumber);

    // Statuts en cours qui affichent le composant de progression
    const isPaymentInProgress = status && ['INITIALISATION', 'PENDING', 'ACCEPTED', 'INITIATED'].includes(status);

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Paiement Mobile avec PawaPay</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Payez facilement et sécurisé avec votre mobile money
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox (Test)'}
                </div>
            </div>

            {!isPaymentInProgress && (!status || status === 'FAILED' || status === 'REJECTED') ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Montant à payer
                        </label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                            {formatFCFA(Math.round(displayAmount))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Numéro de téléphone *
                        </label>
                        <input
                            type="tel"
                            // Assure que la valeur est une chaîne même si la propriété est manquante dans paymentInfo
                            value={phoneNumber || ''}
                            onChange={handlePhoneNumberChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${phoneNumber && !isPhoneValid
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                }`}
                            placeholder="237699123456 ou +237699123456"
                            required
                            disabled={isProcessing}
                        />
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p>Format accepté: 237699123456 ou +237699123456</p>
                            {phoneNumber && (
                                <>
                                    <p className={isPhoneValid ? 'text-green-600' : 'text-red-600'}>
                                        {isPhoneValid ? '✓ Format valide' : '✗ Format invalide'}
                                    </p>
                                    <p>Pays détecté: <span className="font-medium">{getCountryFromPhoneNumber(phoneNumber)}</span></p>
                                    <p className="text-blue-600">Numéro envoyé: <span className="font-mono">{cleanedPhoneForDisplay || 'aucun'}</span></p>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opérateur mobile *
                        </label>
                        <select
                            value={provider || ''} // Assure que la valeur est une chaîne
                            onChange={handleProviderChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={isProcessing}
                        >
                            <option value="">Sélectionnez votre opérateur</option>
                            {filteredProviders.map((providerOption) => (
                                <option key={providerOption.value} value={providerOption.value}>
                                    {providerOption.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing || !isPhoneValid || !provider || displayAmount <= 0}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isProcessing || !isPhoneValid || !provider || displayAmount <= 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                    >
                        {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Traitement en cours...
                            </div>
                        ) : (
                            `Payer ${formatFCFA(Math.round(displayAmount))}`
                        )}
                    </button>

                    {(status === 'FAILED' || status === 'REJECTED') && (
                        <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg text-sm">
                            {paymentResult?.message || "Veuillez vérifier vos informations et réessayer."}
                        </div>
                    )}
                </form>
            ) : (
                // Affichage de la progression du paiement
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${status === 'COMPLETED' ? 'bg-green-50 border-green-200' :
                        status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED' ? 'bg-blue-50 border-blue-200' :
                            'bg-yellow-50 border-yellow-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            {status === 'COMPLETED' ? (
                                <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED') ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mt-0.5 flex-shrink-0"></div>
                            ) : (
                                <svg className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                            )}

                            <div className="flex-1">
                                <h3 className={`font-semibold ${status === 'COMPLETED' ? 'text-green-800' :
                                    status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED' ? 'text-blue-800' :
                                        'text-yellow-800'
                                    }`}>
                                    {status === 'COMPLETED' ? 'Paiement Réussi 🎉' :
                                        status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED' ? 'En Attente de Confirmation' :
                                            'Traitement en Cours'}
                                </h3>

                                <p className={`text-sm mt-1 ${status === 'COMPLETED' ? 'text-green-700' :
                                    status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED' ? 'text-blue-700' :
                                        'text-yellow-700'
                                    }`}>
                                    {status === 'COMPLETED' ? 'Paiement confirmé ! Redirection...' :
                                        status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED' ? 'Veuillez confirmer la transaction sur votre mobile.' :
                                            'Vérification du statut...'}
                                </p>

                                {(status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED') && (
                                    <div className="mt-4 p-3 bg-white rounded-lg border">
                                        <h4 className="font-medium text-gray-900 mb-2">📱 Confirmation requise</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Une notification a été envoyée à votre téléphone ({cleanedPhoneForDisplay}).
                                        </p>
                                        <ul className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                                            <li>• Confirmer le paiement de <strong>{formatFCFA(Math.round(displayAmount))}</strong></li>
                                            <li>• Saisir votre code PIN pour valider</li>
                                            <li>• Le statut se mettra à jour automatiquement</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {currentDepositId && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Détails de la transaction</h4>
                            <div className="text-sm text-gray-600 space-y-2">
                                <div className="flex justify-between">
                                    <span>Référence PawaPay:</span>
                                    <span className="font-mono text-xs">{currentDepositId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Montant:</span>
                                    <span className="font-semibold">{formatFCFA(Math.round(displayAmount))}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Opérateur:</span>
                                    <span>{providers.find(p => p.value === provider)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Statut PawaPay:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                        status === 'PENDING' || status === 'ACCEPTED' || status === 'INITIATED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default PawaPayPayment;