import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
	// Proveravamo sesiju na serveru
	const { userId } = await auth();

	return (
		<div className='w-full min-h-full bg-[#09090b] text-white font-sans selection:bg-emerald-500 selection:text-zinc-950 flex flex-col items-center justify-center'>
			{/* HERO SEKCIJA */}
			<main className='max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 flex flex-col items-center justify-center text-center'>
				<div className='inline-block border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-6'>
					[ Status: Production Ready ]
				</div>

				<h1 className='text-4xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight max-w-5xl leading-none'>
					Autonomous Infrastructure For{' '}
					<span className='text-zinc-500'>Business Scheduling</span>
				</h1>

				<p className='mt-8 font-sans text-base md:text-lg text-zinc-400 max-w-2xl font-light'>
					Scale your operation with an automated, multi-tenant scheduling
					engine. Orchestrate team availability, process global payments via
					Stripe, and access deep analytical insights out of the box.
				</p>

				{/* HERO DUGMIĆI SA PAMETNOM PROVEROM */}
				<div className='mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto'>
					{userId ? (
						<Link
							href='/dashboard'
							className='w-full sm:w-auto'>
							<Button className='w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-12 px-8'>
								Return to Mission Control [Dashboard]
							</Button>
						</Link>
					) : (
						<Link
							href='/login'
							className='w-full sm:w-auto'>
							<Button className='w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-12 px-8'>
								Deploy Platform
							</Button>
						</Link>
					)}

					<Link
						href='#docs'
						className='w-full sm:w-auto'>
						<Button
							variant='outline'
							className='w-full sm:w-auto border-zinc-800 bg-[#0c0c0e] hover:bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-none h-12 px-8'>
							Read Docs
						</Button>
					</Link>
				</div>
			</main>
		</div>
	);
}
