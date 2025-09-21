import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudiosService } from './studios.service';
import { CreateStudioDto, UpdateStudioDto } from './dto/studio.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createStudioDto: CreateStudioDto, @Request() req) {
    return this.studiosService.create(createStudioDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('city') city?: string,
  ) {
    return this.studiosService.findAll(page, limit, city);
  }

  @Get('my-studios')
  @UseGuards(JwtAuthGuard)
  findMyStudios(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.studiosService.findByOwner(req.user.id, page, limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req) {
    return this.studiosService.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studiosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudioDto: UpdateStudioDto,
    @Request() req,
  ) {
    return this.studiosService.update(id, updateStudioDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.studiosService.remove(id, req.user.id);
  }
}
