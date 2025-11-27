// reservations.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: any) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  // 🟢 NOUVEL ENDPOINT pour récupérer les réservations de l'utilisateur connecté
  @Get('my-reservations')
  @UseGuards(JwtAuthGuard)
  async getMyReservations(@Request() req) {
    const userId = req.user.id; // L'ID est automatiquement extrait du token JWT
    const reservations = await this.reservationsService.findByUserId(userId);
    
    return {
      success: true,
      reservations: reservations,
      count: reservations.length
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateReservationDto: any) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.remove(id);
  }
  
}