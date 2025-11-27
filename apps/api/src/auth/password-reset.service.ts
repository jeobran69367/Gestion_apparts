import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Always return success message for security reasons
    const successMessage = {
      message: 'Si cette adresse email existe, un email de réinitialisation a été envoyé.',
    };

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success message even if user doesn't exist (security best practice)
      return successMessage;
    }

    // Generate a unique token
    const token = uuidv4();

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate any existing tokens for this email
    await this.prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Create new token
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        email,
        expiresAt,
      },
    });

    // Send email with reset link
    await this.sendPasswordResetEmail(email, token, user.firstName);

    return successMessage;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Token de réinitialisation invalide.');
    }

    if (resetToken.used) {
      throw new BadRequestException('Ce token a déjà été utilisé.');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Ce token a expiré. Veuillez demander un nouveau lien.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return { message: 'Votre mot de passe a été réinitialisé avec succès.' };
  }

  private async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(email, resetLink, firstName);
  }
}
