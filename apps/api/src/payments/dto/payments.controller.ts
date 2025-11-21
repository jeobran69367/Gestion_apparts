import { IsNotEmpty, IsInt, IsDateString, IsOptional, IsString, IsJSON, IsEnum } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsInt()
  amount: number; // Montant en centimes

  @IsNotEmpty()
  @IsString()
  currency: string; // Devise

  @IsNotEmpty()
  @IsEnum(PaymentMethod, { message: 'Méthode de paiement invalide.' })
  method: PaymentMethod; // Méthode de paiement

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Statut de paiement invalide.' })
  status?: PaymentStatus; // Statut du paiement

  @IsOptional()
  @IsString()
  externalId?: string; // Identifiant externe du processeur de paiement

  @IsOptional()
  @IsJSON()
  externalData?: any; // Données supplémentaires du processeur

  @IsOptional()
  @IsString()
  failureReason?: string; // Raison de l'échec du paiement

  @IsOptional()
  @IsInt()
  refundAmount?: number; // Montant remboursé

  @IsOptional()
  @IsString()
  refundReason?: string; // Raison du remboursement

  @IsOptional()
  @IsDateString()
  refundedAt?: string; // Date du remboursement

  @IsNotEmpty()
  @IsInt()
  reservationId: number; // Clé étrangère vers la réservation

  @IsNotEmpty()
  @IsInt()
  userId: number; // Clé étrangère vers l'utilisateur
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsInt()
  amount?: number; // Montant en centimes

  @IsOptional()
  @IsString()
  currency?: string; // Devise

  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Méthode de paiement invalide.' })
  method?: PaymentMethod; // Méthode de paiement

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'Statut de paiement invalide.' })
  status?: PaymentStatus; // Statut du paiement

  @IsOptional()
  @IsString()
  externalId?: string; // Identifiant externe du processeur de paiement

  @IsOptional()
  @IsJSON()
  externalData?: any; // Données supplémentaires du processeur

  @IsOptional()
  @IsString()
  failureReason?: string; // Raison de l'échec du paiement

  @IsOptional()
  @IsInt()
  refundAmount?: number; // Montant remboursé

  @IsOptional()
  @IsString()
  refundReason?: string; // Raison du remboursement

  @IsOptional()
  @IsDateString()
  refundedAt?: string; // Date du remboursement

  @IsOptional()
  @IsDateString()
  processedAt?: string; // Date de traitement du paiement
}