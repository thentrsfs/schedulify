import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import BookingForm from '@/app/book/[businessSlug]/BookingForm';

interface BookPageProps {
	params: Promise<{ businessSlug: string }>;
}

export default async function PublicBookingPage({ params }: BookPageProps) {
	const { businessSlug } = await params;

	const business = await db.business.findFirst({
		where: { slug: businessSlug },
		include: {
			services: true,
			employees: { include: { user: true } },
		},
	});

	if (!business) notFound();

	return (
		<div className='w-full min-h-screen pt-12 bg-[#09090b] font-sans text-white flex items-center justify-center px-4'>
			<div className='max-w-md w-full border border-zinc-900 bg-[#0c0c0e] p-8 space-y-6'>
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
