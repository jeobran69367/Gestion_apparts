// Payments.module.ts
import { Module } from '@nestjs/common';
import {  PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
  exports: [PaymentsService], // Optionnel, si d'autres modules en ont besoin
})
export class PaymentsModule {}