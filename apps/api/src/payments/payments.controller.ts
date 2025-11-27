import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, UseGuards, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Endpoint pour récupérer les studios avec réservations et paiements pour un admin/propriétaire
  @Get('studio-payments')
  @UseGuards(JwtAuthGuard)
  async getStudioPayments(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    const studioPayments = await this.paymentsService.getStudioPayments(
      userId,
      userRole,
      startDate,
      endDate,
    );
    return {
      message: 'Paiements des studios récupérés avec succès',
      data: studioPayments,
    };
  }

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentsService.create(createPaymentDto);
    return { message: 'Paiement créé avec succès', data: payment };
  }

  @Get()
  async findAll() {
    const payments = await this.paymentsService.findAll();
    return { message: 'Liste de tous les paiements', data: payments };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const payment = await this.paymentsService.findOne(id);
    return { message: `Paiement avec l'ID ${id} récupéré`, data: payment };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    const updatedPayment = await this.paymentsService.update(id, updatePaymentDto);
    return { message: `Paiement avec l'ID ${id} mis à jour`, data: updatedPayment };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentsService.remove(id);
    return { message: `Paiement avec l'ID ${id} supprimé` };
  }
}

