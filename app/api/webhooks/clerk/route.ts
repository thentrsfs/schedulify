import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env.local', {
      status: 400,
    });
  }

  // Preuzimanje headera za verifikaciju
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Preuzimanje body sadržaja
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);
  let evt: WebhookEvent;

  // Verifikacija da je zahtev zaista došao sa Clerk-a
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  const eventType = evt.type;

  // Kada se korisnik uspešno kreira na Clerk-u
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    console.log('--------------------------------------------------');
    console.log(`🚀 BINGO! Webhook radi! Korisnik registrovan.`);
    console.log(`ID: ${id}`);
    console.log(`Email: ${email}`);
    console.log(`Ime: ${first_name} ${last_name}`);
    console.log('--------------------------------------------------');

    return new Response('User data received!', { status: 200 });
  }

  return new Response('Webhook received', { status: 200 });
}