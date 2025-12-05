import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'studios');

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  validateImage(file: Express.Multer.File): void {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('La taille du fichier ne doit pas dépasser 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Seuls les fichiers JPEG, PNG et WEBP sont autorisés');
    }
  }

  getImageUrl(filename: string, req: any): string {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/api/uploads/studios/${filename}`;
  }

  deleteImage(filename: string): void {
    try {
      const filePath = join(this.uploadPath, filename);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      console.error(`Error deleting file ${filename}:`, error);
    }
  }

  extractFilenameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch (error) {
      return null;
    }
  }
}
