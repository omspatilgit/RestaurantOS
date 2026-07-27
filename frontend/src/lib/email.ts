import emailjs from '@emailjs/browser';

// IMPORTANT: Replace these with your actual EmailJS credentials
const SERVICE_ID = 'service_m1nf2pr';
const TEMPLATE_ID = 'template_acttvbr';
const PUBLIC_KEY = 'zpe8X3Ijbo7C1MhiD';

export interface BookingDetails {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  party_size: number;
}

export const sendBookingConfirmation = async (booking: BookingDetails) => {
  try {
    const templateParams = {
      to_name: booking.name,
      email: booking.email,
      booking_id: booking.id,
      date: booking.date,
      time: booking.time,
      party_size: booking.party_size,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      {
        publicKey: PUBLIC_KEY,
      }
    );
    console.log('SUCCESS! Email sent.', response.status, response.text);
  } catch (err) {
    console.error('FAILED to send email.', err);
  }
};
