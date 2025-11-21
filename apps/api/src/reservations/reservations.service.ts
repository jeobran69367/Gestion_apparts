// reservations.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: number) {
    return this.prisma.reservation.findMany({
      where: {
        guestId: userId,
      },
      include: {
        studio: {
          select: {
            id: true,
            name: true,
            city: true,
            photos: true,
            address: true,
            pricePerNight: true,
          },
        },
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: any) {
    const { checkIn, checkOut, studioId, guestId } = data;

    // Validate foreign keys
    const studio = await this.prisma.studio.findUnique({ where: { id: studioId } });
    if (!studio) {
      throw new Error('Studio not found');
    }

    const guest = await this.prisma.user.findUnique({ where: { id: guestId } });
    if (!guest) {
      throw new Error('Guest not found');
    }

    // Calculate derived fields
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    const subtotal = studio.pricePerNight * nights;
    const total = subtotal + (data.cleaningFee || 0) + (data.serviceFee || 0) + (data.taxes || 0);

    // Create reservation
    return this.prisma.reservation.create({
      data: {
        ...data,
        nights,
        subtotal,
        total,
      },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany({
      select: {
        id: true,
        studio: {
          select: {
            name: true,
            photos: true,
          },
        },
        checkIn: true,
        checkOut: true,
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    }).then(reservations => {
      return reservations.map(reservation => {
        const checkInDate = new Date(reservation.checkIn);
        const checkOutDate = new Date(reservation.checkOut);
        const numberOfDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...reservation,
          checkIn: checkInDate.toLocaleString(),
          checkOut: checkOutDate.toLocaleString(),
          numberOfDays,
          studioName: reservation.studio.name,
          studioImages: reservation.studio.photos.slice(0, 2),
        };
      });
    });
  }

  findOne(id: number) {
    return this.prisma.reservation.findUnique({
      where: { id },
      include: {
        studio: {
          select: {
            name: true,
            photos: true,
          },
        },
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    }).then(reservation => {
      if (!reservation) return null;

      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);
      const numberOfDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: reservation.id,
        studioName: reservation.studio.name,
        studioImages: reservation.studio.photos,
        guest: reservation.guest,
        checkIn: checkInDate.toLocaleString(),
        checkOut: checkOutDate.toLocaleString(),
        numberOfDays,
      };
    });
  }

  update(id: number, data: any) {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.reservation.delete({ where: { id } });
  }

}