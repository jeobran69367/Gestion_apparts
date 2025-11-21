import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.controller';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

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
