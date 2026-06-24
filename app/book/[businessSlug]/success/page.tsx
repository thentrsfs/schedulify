import Link from 'next/link';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

interface SuccessPageProps {
	params: Promise<{
		businessSlug: string;
	}>;
}

export default async function BookingSuccessPage({ params }: SuccessPageProps) {
	const { businessSlug } = await params;

	const business = await db.business.findFirst({
		where: { slug: businessSlug },
	});

	if (!business) notFound();

	return (
		<div className='w-full min-h-screen pt-12 bg-[#09090b] font-sans text-white flex items-center justify-center px-4'>
			<div className='max-w-md w-full border border-emerald-500/30 bg-[#0c0c0e] p-8 space-y-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.05)]'>
				{/* VELIKA EMERALD POTVRDA */}
				<div className='space-y-2'>
					<div className='w-16 h-16 bg-emerald-500/10 border border-emerald-500 text-emerald-400 font-mono text-xl font-bold mx-auto flex items-center justify-center mb-4 animate-pulse'>
						✓
					</div>
					<span className='font-mono text-xs uppercase tracking-widest text-emerald-400 block'>
						{'[ status: transmission_successful ]'}
					</span>
					<h1 className='text-2xl font-bold uppercase tracking-tight text-white'>
						Request Deployed
					</h1>
					<p className='text-xs text-zinc-400 font-mono max-w-sm mx-auto leading-relaxed'>
						Your request for business{' '}
						<span className='text-zinc-200 font-sans font-semibold'>
							{business.name}
						</span>{' '}
						is successfully deployed.
					</p>
				</div>

				<div className='border-t border-zinc-900 pt-6'>
					<Link
						href={`/book/${businessSlug}`}
						className='inline-block w-full border border-zinc-800 bg-[#09090b] hover:bg-zinc-900 hover:text-white text-zinc-400 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 leading-[42px] transition-all'>
						Return to Portal
					</Link>
				</div>
			</div>
		</div>
	);
}
