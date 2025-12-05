import { Router } from 'express';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

const emailRouter: Router = Router();
const emailService = new EmailService();
const emailController = new EmailController(emailService);

// Route pour envoyer un email
emailRouter.post('/send-email', emailController.sendEmail.bind(emailController));

export default emailRouter;
