import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class UploadsService {
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
}
