import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db'; // <-- Uvozimo našu Prismu

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env.local', {
      status: 400,
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', { status: 400 });
  }

  const eventType = evt.type;

  // 🚀 OVDE UPISUJEMO U NEON BAZU
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response('Error: No email found for user', { status: 400 });
    }

    // Spajamo ime i prezime za tvoje "name" polje u bazi
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      // Koristimo Prisma upsert ili create da ubacimo korisnika u bazu
      const newUser = await db.user.create({
        data: {
          id: id, // Čuvamo originalni Clerk ID (npr. user_2abc...)
          email: email,
          name: fullName || null,
          image: image_url || null,
          role: 'CUSTOMER', // Default uloga po tvom modelu
        },
      });

      console.log('--------------------------------------------------');
      console.log(`🎉 KORISNIK USPEŠNO UPISAN U NEON BAZU!`);
      console.log(`Korisnik ID u bazi: ${newUser.id}`);
      console.log('--------------------------------------------------');

    } catch (error) {
      console.error('Prisma Error: Greška pri upisu u bazu podataka:', error);
      return new Response('Database error', { status: 500 });
    }

    return new Response('User data synced to DB!', { status: 200 });
  }

  return new Response('Webhook received', { status: 200 });
}