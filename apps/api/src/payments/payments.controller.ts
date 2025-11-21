import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payments.controller';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

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

