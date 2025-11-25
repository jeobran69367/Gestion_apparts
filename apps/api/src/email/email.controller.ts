import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-email')
  async sendEmail(@Body() body: any) {
    console.log('📨 Données reçues:', body);
    
    const { recipientEmail, reservationDetails } = body;
    
    if (!recipientEmail) {
      throw new HttpException(
        'Missing required field: recipientEmail', 
        HttpStatus.BAD_REQUEST
      );
    }

    if (!reservationDetails) {
      throw new HttpException(
        'Missing required field: reservationDetails', 
        HttpStatus.BAD_REQUEST
      );
    }

    // Validation supplémentaire des champs requis dans reservationDetails
    const requiredFields = ['studioId', 'checkIn', 'checkOut', 'total', 'guestInfo'];
    const missingFields = requiredFields.filter(field => !reservationDetails[field]);
    
    if (missingFields.length > 0) {
      throw new HttpException(
        `Missing fields in reservationDetails: ${missingFields.join(', ')}`, 
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      await this.emailService.sendReservationConfirmation(recipientEmail, reservationDetails);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('❌ Erreur EmailService:', error);
      throw new HttpException(
        'Failed to send email', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}