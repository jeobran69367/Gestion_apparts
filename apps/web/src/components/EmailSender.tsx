import React, { useState } from 'react';

interface EmailSenderProps {
  recipientEmail: string;
  subject: string;
  message: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const EmailSender: React.FC<EmailSenderProps> = ({ recipientEmail, subject, message, onSuccess, onError }) => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const sendEmail = async () => {
    setIsSending(true);
    setError('');

    try {
      // Utilisation d'un service tiers comme SendGrid ou Mailgun
      const response = await fetch('/api/email/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to send email');
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message);
      onError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="email-sender">
      {error && <p className="error-message">Error: {error}</p>}
      <button
        onClick={sendEmail}
        disabled={isSending}
        className="send-email-button bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {isSending ? 'Sending...' : 'Send Email'}
      </button>
    </div>
  );
};

export default EmailSender;
