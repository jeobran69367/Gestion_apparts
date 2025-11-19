import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudioDto, UpdateStudioDto } from './dto/studio.dto';

@Injectable()
export class StudiosService {
  constructor(private prisma: PrismaService) {}

  async create(createStudioDto: CreateStudioDto, ownerId: number) {
    return this.prisma.studio.create({
      data: {
        ...createStudioDto,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, city?: string) {
    const skip = (page - 1) * limit;
    
    const where = {
      isAvailable: true,
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
    };

    const [studios, total] = await Promise.all([
      this.prisma.studio.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.studio.count({ where }),
    ]);

    return {
      studios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const studio = await this.prisma.studio.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        reservations: {
          where: {
            status: 'CONFIRMED',
          },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!studio) {
      throw new NotFoundException('Studio non trouvé');
    }

    return studio;
  }

  async findByOwner(ownerId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [studios, total] = await Promise.all([
      this.prisma.studio.findMany({
        where: { ownerId },
        skip,
        take: limit,
        include: {
          reservations: {
            where: {
              status: 'CONFIRMED',
            },
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              total: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.studio.count({ where: { ownerId } }),
    ]);

    return {
      studios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: number, updateStudioDto: UpdateStudioDto, userId: number) {
    const studio = await this.prisma.studio.findUnique({
      where: { id },
    });

    if (!studio) {
      throw new NotFoundException('Studio non trouvé');
    }

    if (studio.ownerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres studios');
    }

    return this.prisma.studio.update({
      where: { id },
      data: updateStudioDto,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const studio = await this.prisma.studio.findUnique({
      where: { id },
    });

    if (!studio) {
      throw new NotFoundException('Studio non trouvé');
    }

    if (studio.ownerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres studios');
    }

    return this.prisma.studio.delete({
      where: { id },
    });
  }

  async getReservations(studioId: number) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        studioId,
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
      orderBy: {
        checkIn: 'asc',
      },
    });

    return reservations;
  }

  async getStats(ownerId: number) {
    const [totalStudios, activeStudios, totalReservations, totalRevenue] = await Promise.all([
      this.prisma.studio.count({ where: { ownerId } }),
      this.prisma.studio.count({ where: { ownerId, isAvailable: true } }),
      this.prisma.reservation.count({
        where: {
          studio: { ownerId },
          status: 'CONFIRMED',
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          reservation: {
            studio: { ownerId },
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalStudios,
      activeStudios,
      totalReservations,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
