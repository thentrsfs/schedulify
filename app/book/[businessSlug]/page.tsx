import { db } from '@/lib/db';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import BookingForm from '@/app/book/[businessSlug]/BookingForm';
import Link from 'next/link';

interface BookPageProps {
	params: Promise<{ businessSlug: string }>;
}

export async function generateMetadata({
	params,
}: BookPageProps): Promise<Metadata> {
	const { businessSlug } = await params;

	// Vučemo salon iz baze na osnovu sluga iz URL-a
	const business = await db.business.findUnique({
		where: { slug: businessSlug },
	});

	// Ako salon ne postoji u bazi
	if (!business) {
		return {
			title: {
				absolute: 'Salon nije pronađen // Schedulify',
			},
		};
	}

	// Ako postoji, "zaključavamo" tačno ime salona u tabu browsera
	return {
		title: {
			absolute: `${business.name} | Zakaži Termin`,
		},
		description: `Online zakazivanje termina za salon ${business.name} putem Schedulify platforme.`,
		openGraph: {
			title: `${business.name} | Zakaži Termin`,
			description: `Online zakazivanje termina za salon ${business.name}.`,
			type: 'website',
		},
	};
}

export default async function PublicBookingPage({ params }: BookPageProps) {
	const { businessSlug } = await params;
	const { userId } = await auth();

	const business = await db.business.findFirst({
		where: { slug: businessSlug },
		include: {
			services: true,
			employees: { include: { user: true } },
		},
	});

	// Proveri da li je posetilac zapravo vlasnik ovog biznisa
	const isOwner = userId && business && business.ownerId === userId;

	if (!business) notFound();

	return (
		<div className='w-full min-h-screen p-6 bg-[#09090b] font-sans text-white flex items-center justify-center relative'>
			{isOwner && (
				<div className='absolute top-6 left-6 lg:top-8 lg:left-12'>
					<Link
						href='/dashboard'
						className='flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors duration-200 border border-zinc-900 bg-[#0c0c0e] px-4 py-2 hover:border-emerald-500/30'>
						<span className='text-emerald-400 font-bold'>&lt;--</span> Return to
						Command Center
					</Link>
				</div>
			)}
			<div className='max-w-md w-full border border-zinc-900 bg-[#0c0c0e] p-6 space-y-6 max-sm:mt-12'>
				<div className='space-y-1 text-center border-b border-zinc-900 pb-6'>
					<span className='font-mono text-xs uppercase tracking-widest text-emerald-400 block mb-1'>
						{`[ terminal: secure_booking_portal ]`}
					</span>
					<h1 className='text-2xl font-bold uppercase tracking-tight'>
						{business.name}
					</h1>
					<p className='text-xs text-zinc-500 font-mono'>
						Select your mission specs and deploy request.
					</p>
				</div>

				{/* Renderujemo klijentsku formu i prosleđujemo joj podatke */}
				<BookingForm business={business} />
			</div>
		</div>
	);
}
