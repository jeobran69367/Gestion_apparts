import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  Get,
  Param,
  Res,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import { existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('studios/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'studios');
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `studio-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(new Error('Seuls les fichiers JPEG, PNG et WEBP sont autorisés'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      return { urls: [] };
    }

    // Validate all files
    files.forEach((file) => this.uploadsService.validateImage(file));

    // Generate URLs for all uploaded files
    const urls = files.map((file) =>
      this.uploadsService.getImageUrl(file.filename, req),
    );

    return {
      urls,
      message: `${files.length} image(s) uploadée(s) avec succès`,
    };
  }

  @Get('studios/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'studios', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Image non trouvée');
    }

    return res.sendFile(filePath);
  }

  @Delete('studios/images')
  @UseGuards(JwtAuthGuard)
  async deleteImages(@Body('urls') urls: string[]) {
    if (!urls || urls.length === 0) {
      return { message: 'Aucune image à supprimer' };
    }

    let deletedCount = 0;
    urls.forEach((url) => {
      const filename = this.uploadsService.extractFilenameFromUrl(url);
      if (filename) {
        this.uploadsService.deleteImage(filename);
        deletedCount++;
      }
    });

    return {
      message: `${deletedCount} image(s) supprimée(s) avec succès`,
    };
  }
}
