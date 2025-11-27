import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.controller';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Récupérer les studios avec réservations et paiements pour un admin/propriétaire
  async getStudioPayments(
    userId: number,
    userRole: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      // Construire le filtre de date pour les réservations
      const dateFilter: { checkIn?: { gte?: Date }; checkOut?: { lte?: Date } } = {};
      if (startDate) {
        dateFilter.checkIn = { gte: new Date(startDate) };
      }
      if (endDate) {
        dateFilter.checkOut = { lte: new Date(endDate) };
      }

      // Récupérer les studios de l'utilisateur connecté
      // Note: Pour l'instant, tous les utilisateurs récupèrent uniquement leurs propres studios
      // Les admins peuvent voir les statistiques détaillées de leurs studios
      const whereClause = { ownerId: userId };

      const studios = await this.prisma.studio.findMany({
        where: whereClause,
        include: {
          reservations: {
            where: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            include: {
              guest: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
              payments: {
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  method: true,
                  status: true,
                  createdAt: true,
                  processedAt: true,
                },
              },
            },
            orderBy: {
              checkIn: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculer les statistiques par studio
      const studiosWithStats = studios.map((studio) => {
        const totalReservations = studio.reservations.length;
        const totalRevenue = studio.reservations.reduce((sum, reservation) => {
          const reservationPayments = reservation.payments.reduce((paymentSum, payment) => {
            if (payment.status === 'COMPLETED') {
              return paymentSum + payment.amount;
            }
            return paymentSum;
          }, 0);
          return sum + reservationPayments;
        }, 0);

        const pendingPayments = studio.reservations.reduce((sum, reservation) => {
          return sum + reservation.payments.filter((p) => p.status === 'PENDING').length;
        }, 0);

        return {
          id: studio.id,
          name: studio.name,
          address: studio.address,
          city: studio.city,
          pricePerNight: studio.pricePerNight,
          isAvailable: studio.isAvailable,
          photos: studio.photos,
          stats: {
            totalReservations,
            totalRevenue,
            pendingPayments,
          },
          reservations: studio.reservations.map((reservation) => ({
            id: reservation.id,
            checkIn: reservation.checkIn,
            checkOut: reservation.checkOut,
            nights: reservation.nights,
            total: reservation.total,
            status: reservation.status,
            guest: reservation.guest,
            payments: reservation.payments,
          })),
        };
      });

      // Calculer les statistiques globales
      const globalStats = {
        totalStudios: studios.length,
        totalReservations: studiosWithStats.reduce((sum, s) => sum + s.stats.totalReservations, 0),
        totalRevenue: studiosWithStats.reduce((sum, s) => sum + s.stats.totalRevenue, 0),
        totalPendingPayments: studiosWithStats.reduce((sum, s) => sum + s.stats.pendingPayments, 0),
      };

      this.logger.log(`Récupération des paiements pour l'utilisateur ${userId} avec rôle ${userRole}`);

      return {
        globalStats,
        studios: studiosWithStats,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des paiements des studios', error.stack);
      throw new ForbiddenException('Erreur lors de la récupération des paiements des studios.');
    }
  }

  async create(createPaymentDto: CreatePaymentDto) {
    try {
      const payment = await this.prisma.payment.create({
        data: createPaymentDto,
      });
      this.logger.log(`Paiement créé avec succès: ${payment.id}`);
      return payment;
    } catch (error) {
      this.logger.error('Erreur lors de la création du paiement', error.stack);
      throw new ForbiddenException('Erreur lors de la création du paiement. Veuillez vérifier les données fournies.');
    }
  }

  async findAll() {
    try {
      const payments = await this.prisma.payment.findMany();
      this.logger.log(`Récupération de ${payments.length} paiements.`);
      return payments;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des paiements', error.stack);
      throw new ForbiddenException('Erreur lors de la récupération des paiements.');
    }
  }

  async findOne(id: number) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });
      if (!payment) {
        this.logger.warn(`Paiement avec l'ID ${id} non trouvé.`);
        throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé.`);
      }
      this.logger.log(`Paiement récupéré: ${id}`);
      return payment;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du paiement avec l'ID ${id}`, error.stack);
      throw new ForbiddenException('Erreur lors de la récupération du paiement.');
    }
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });
      if (!payment) {
        this.logger.warn(`Paiement avec l'ID ${id} non trouvé pour mise à jour.`);
        throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé.`);
      }
      const updatedPayment = await this.prisma.payment.update({
        where: { id },
        data: updatePaymentDto,
      });
      this.logger.log(`Paiement mis à jour: ${id}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du paiement avec l'ID ${id}`, error.stack);
      throw new ForbiddenException('Erreur lors de la mise à jour du paiement.');
    }
  }

  async remove(id: number) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });
      if (!payment) {
        this.logger.warn(`Paiement avec l'ID ${id} non trouvé pour suppression.`);
        throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé.`);
      }
      await this.prisma.payment.delete({
        where: { id },
      });
      this.logger.log(`Paiement supprimé: ${id}`);
      return { message: `Paiement avec l'ID ${id} supprimé.` };
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du paiement avec l'ID ${id}`, error.stack);
      throw new ForbiddenException('Erreur lors de la suppression du paiement.');
    }
  }
}
