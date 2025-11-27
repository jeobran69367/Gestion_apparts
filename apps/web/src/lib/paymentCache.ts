// Simple cache en mémoire pour stocker les statuts de paiement Monetbil
interface PaymentStatus {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';
  message: string;
  amount?: number;
  channel?: string;
  phone?: string;
  timestamp: string;
  rawData?: any;
}

class PaymentCache {
  private cache: Map<string, PaymentStatus> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // Stocker un statut de paiement
  set(paymentId: string, status: PaymentStatus): void {
    this.cache.set(paymentId, {
      ...status,
      timestamp: new Date().toISOString()
    });
    
    // Auto-cleanup après TTL
    setTimeout(() => {
      this.delete(paymentId);
    }, this.CACHE_TTL);
  }

  // Récupérer un statut de paiement
  get(paymentId: string): PaymentStatus | null {
    const status = this.cache.get(paymentId);
    if (status) {
      return status;
    }
    return null;
  }

  // Supprimer un statut de paiement
  delete(paymentId: string): void {
    const deleted = this.cache.delete(paymentId);
    if (deleted) {
      }
  }

  // Lister tous les statuts (pour debug)
  list(): Array<{paymentId: string, status: PaymentStatus}> {
    const items = [];
    for (const [paymentId, status] of this.cache.entries()) {
      items.push({ paymentId, status });
    }
    return items;
  }

  // Nettoyer le cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
  }
}

// Instance globale du cache (Singleton)
const paymentCache = new PaymentCache();

export { paymentCache, type PaymentStatus };
