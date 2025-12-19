import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';

dotenv.config();

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Réinitialisation de votre mot de passe — MonAppart',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏠 MonAppart</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Bonjour ${firstName},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Ce lien est valide pendant 1 heure.</p>
            <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de réinitialisation envoyé à:', to);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }

  async sendReservationConfirmation(to: string, reservationDetails: any) {
  console.log('📧 Préparation email à:', to);
  console.log('📋 Détails réservation:', reservationDetails);

  const { studioId, checkIn, checkOut, guestInfo, total } = reservationDetails;

  // Validation des données nécessaires pour l'email
  if (!studioId || !checkIn || !checkOut || !total) {
    console.error('❌ Données manquantes pour l\'email');
    throw new Error('Données de réservation incomplètes pour l\'email');
  }

  // Générer un PDF professionnel en mémoire avec pdfkit et l'envoyer en pièce jointe
  const pdfBuffer: Buffer = await new Promise<Buffer>((resolve, reject) => {
    // Import dynamique pour éviter d'avoir à ajouter en-tête d'import si non présent
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    // Générer des informations de facture
    const invoiceNumber = `INV-${Date.now()}`;
    const issueDate = new Date().toLocaleDateString();

    // Calcul basique des lignes de facture : si des items sont fournis, on les utilise,
    // sinon on crée une ligne "Séjour" à partir des dates et du total.
    const itemsFromInput: any[] = reservationDetails.items || [];
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(
      1,
      Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    let items: { description: string; qty: number; unit: number; amount: number }[] = [];

    if (itemsFromInput.length > 0) {
      items = itemsFromInput.map((it: any) => ({
      description: it.description || 'Item',
      qty: it.qty ?? 1,
      unit: it.unit ?? 0,
      amount: (it.amount ?? (it.qty ?? 1) * (it.unit ?? 0)),
      }));
    } else {
      const pricePerNight =
      reservationDetails.pricePerNight ??
      (typeof total === 'number' && nights > 0 ? Math.round((total / nights) * 100) / 100 : total || 0);

      items.push({
      description: `Séjour — Studio ${studioId}`,
      qty: nights,
      unit: pricePerNight,
      amount: Math.round((pricePerNight * nights) * 100) / 100,
      });
    }

    const subtotal = items.reduce((s, it) => s + it.amount, 0);
    const vatRate = reservationDetails.vatRate ?? 0; // ex: 0.18 pour 18%
    const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
    const totalComputed = Math.round((subtotal + vatAmount) * 100) / 100;
    const displayedTotal = typeof total === 'number' ? total : totalComputed;

    // Entête visuel
    const pageWidth = doc.page.width;
    const marginLeft = doc.page.margins.left;
    const usableWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

    // Bande supérieure
    doc
      .rect(0, 0, pageWidth, 90)
      .fill('#2c3e50');

    doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
      .text('MonAppart — Facture', marginLeft, 30, { align: 'left' });

    doc.fontSize(12).font('Helvetica').text(`FACTURE\n${invoiceNumber}`, marginLeft, 30, {
      align: 'right',
      width: usableWidth,
    });

    doc.moveDown(4);
    doc.fillColor('#000').fontSize(10);

    // Infos facture / client
    const startY = doc.y;
    doc.font('Helvetica-Bold').text('Facturé à :', marginLeft, startY);
    doc.font('Helvetica').fontSize(10);
    const customerLines = [
      `${guestInfo?.firstName || ''} ${guestInfo?.lastName || ''}`.trim(),
      guestInfo?.email || '',
      guestInfo?.phone || '',
    ].filter(Boolean);
    doc.text(customerLines.join('\n'), marginLeft, doc.y);

    // Infos facture à droite (numéro, date, studio)
    const metaX = marginLeft + usableWidth * 0.55;
    const metaWidth = usableWidth * 0.45;
    doc.font('Helvetica-Bold').fontSize(10).text('Détails facture :', metaX, startY, { width: metaWidth, align: 'right' });
    doc.font('Helvetica').fontSize(10).text(`Numéro: ${invoiceNumber}\nDate: ${issueDate}\nStudio ID: ${studioId}`, {
      width: metaWidth,
      align: 'right',
    });

    doc.moveDown(1.5);

    // Table des items (en-têtes)
    const tableTop = doc.y;
    const colDescWidth = usableWidth * 0.55;
    const colQtyWidth = usableWidth * 0.12;
    const colUnitWidth = usableWidth * 0.16;
    const colAmountWidth = usableWidth - colDescWidth - colQtyWidth - colUnitWidth;

    doc.fontSize(10).fillColor('#444').font('Helvetica-Bold');
    doc.text('Description', marginLeft, tableTop, { width: colDescWidth });
    doc.text('Qté', marginLeft + colDescWidth, tableTop, { width: colQtyWidth, align: 'right' });
    doc.text('Prix unitaire', marginLeft + colDescWidth + colQtyWidth, tableTop, { width: colUnitWidth, align: 'right' });
    doc.text('Montant', marginLeft + colDescWidth + colQtyWidth + colUnitWidth, tableTop, { width: colAmountWidth, align: 'right' });

    doc.moveTo(marginLeft, doc.y + 4)
      .lineTo(marginLeft + usableWidth, doc.y + 4)
      .strokeColor('#E0E0E0')
      .stroke();

    doc.moveDown(0.6);

    // Lignes d'items
    doc.font('Helvetica').fontSize(10).fillColor('#000');
    items.forEach((it) => {
      const y = doc.y;
      doc.text(it.description, marginLeft, y, { width: colDescWidth });
      doc.text(String(it.qty), marginLeft + colDescWidth, y, { width: colQtyWidth, align: 'right' });
      doc.text(`${it.unit.toFixed(2)} Fcfa`, marginLeft + colDescWidth + colQtyWidth, y, { width: colUnitWidth, align: 'right' });
      doc.text(`${it.amount.toFixed(2)} Fcfa`, marginLeft + colDescWidth + colQtyWidth + colUnitWidth, y, { width: colAmountWidth, align: 'right' });
      doc.moveDown(1);
    });

    doc.moveDown(0.5);

    // Récapitulatif financier (subtotal, TVA, total)
    const totalsY = doc.y;
    const totalsBoxWidth = 220;
    const totalsX = marginLeft + usableWidth - totalsBoxWidth;

    doc.rect(totalsX - 8, totalsY - 8, totalsBoxWidth + 16, 60).fill('#F8F8F8').stroke('#E8E8E8');
    doc.fillColor('#000').font('Helvetica');

    const labelX = totalsX;
    const valueX = marginLeft + usableWidth - 10;

    doc.fontSize(10).text('Sous-total', labelX, totalsY, { width: totalsBoxWidth - 20, align: 'left' });
    doc.text(`${subtotal.toFixed(2)} Fcfa`, valueX, totalsY, { width: 80, align: 'right' });

    doc.moveDown(0.6);
    doc.text(`TVA (${(vatRate * 100).toFixed(0)}%)`, labelX, doc.y, { width: totalsBoxWidth - 20, align: 'left' });
    doc.text(`${vatAmount.toFixed(2)} Fcfa`, valueX, doc.y, { width: 80, align: 'right' });

    doc.moveDown(0.6);
    doc.font('Helvetica-Bold').fontSize(12).text('Total', labelX, doc.y, { width: totalsBoxWidth - 20, align: 'left' });
    doc.text(`${displayedTotal.toFixed(2)} Fcfa`, valueX, doc.y, { width: 80, align: 'right' });

    doc.moveDown(3);

    // Message professionnel et conditions
    doc.font('Helvetica').fontSize(10).fillColor('#333');
    doc.text(
      "Merci pour votre réservation. Cette facture récapitule le montant dû pour votre séjour. Pour toute question relative à la facture, veuillez répondre à cet email ou contacter notre service réservations.",
      { align: 'left' }
    );

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#666');
    doc.text(`Généré le ${new Date().toLocaleString()}`, { align: 'right' });
    doc.text('Service Réservations — MonAppart', { align: 'right' });

    doc.end();

    // Ligne séparatrice
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .strokeColor('#E0E0E0')
      .stroke()
      .moveDown();

    // Détails client / réservation
    doc.fontSize(11).fillColor('#000');
    const label = (t: string) => doc.font('Helvetica-Bold').text(t, { continued: true }).font('Helvetica').text(' ');

    label('Studio ID:'); doc.text(String(studioId));
    label('Date d\'arrivée:'); doc.text(new Date(checkIn).toLocaleDateString());
    label('Date de départ:'); doc.text(new Date(checkOut).toLocaleDateString());
    label('Nom du client:'); doc.text(`${guestInfo?.firstName || ''} ${guestInfo?.lastName || ''}`);
    if (guestInfo?.email) { label('Email:'); doc.text(guestInfo.email); }
    if (guestInfo?.phone) { label('Téléphone:'); doc.text(guestInfo.phone); }

    doc.moveDown();

    // Résumé financier
    doc
      .rect(doc.x, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 40)
      .fillAndStroke('#F8F8F8', '#E8E8E8');

    doc.fillColor('#000').fontSize(12).text(`Total: ${total} Fcfa`, doc.x + 8, doc.y - 34, { bold: true });

    doc.moveDown(3);

    // Message professionnel
    doc.fontSize(11).fillColor('#333');
    doc.text('Merci pour votre réservation. Nous avons hâte de vous accueillir dans notre studio. Si vous avez des questions ou des demandes particulières, n\'hésitez pas à nous contacter.', {
      align: 'left',
    });

    // Pied de page avec date et signature courte
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#777');
    doc.text(`Généré le ${new Date().toLocaleString()}`, { align: 'right' });
    doc.text('Service Réservations', { align: 'right' });

    doc.end();
  });

  // Corps HTML succinct + pièce jointe PDF
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Confirmation de réservation — Document PDF joint',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height:1.4;">
        <h2 style="color:#2c3e50;">Confirmation de réservation</h2>
        <p>Bonjour ${guestInfo?.firstName || ''},</p>
        <p>Merci pour votre réservation. Vous trouverez en pièce jointe un document PDF professionnel contenant tous les détails de votre séjour.</p>
        <p style="margin-top:16px;">Résumé rapide :</p>
        <ul>
          <li><strong>Studio ID :</strong> ${studioId}</li>
          <li><strong>Arrivée :</strong> ${new Date(checkIn).toLocaleDateString()}</li>
          <li><strong>Départ :</strong> ${new Date(checkOut).toLocaleDateString()}</li>
          <li><strong>Total :</strong> ${total} Fcfa</li>
        </ul>
        <p>À bientôt,<br/>L'équipe Réservations</p>
      </div>
    `,
    attachments: [
      {
        filename: 'confirmation-reservation.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await this.transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès à:', to);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email :', error);
    throw new Error('Impossible d\'envoyer l\'email');
  }
}
}