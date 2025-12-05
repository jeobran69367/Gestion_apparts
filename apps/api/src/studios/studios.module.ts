import { Module } from '@nestjs/common';
import { StudiosController } from './studios.controller';
import { StudiosService } from './studios.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [StudiosController],
  providers: [StudiosService],
})
export class StudiosModule {}
