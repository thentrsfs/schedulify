import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
	return (
		<div className='w-full min-h-[calc(100vh-4rem)] bg-[#09090b] flex flex-col items-center justify-center px-4 relative overflow-hidden'>
			{/* Suptilni tech sjaj u pozadini */}
			<div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none' />

			<div className='max-w-4xl w-full text-center flex flex-col items-center justify-center relative z-10'>
				{/* Značka - koristi čist Inter (font-sans) */}
				<div className='mb-6 rounded-none px-3 py-1 text-xs font-mono tracking-widest uppercase text-emerald-400 bg-emerald-500/5 border border-emerald-500/20'>
					[ status: production ready ]
				</div>

				{/* VELIKI NASLOV - Sada koristi fensi font-heading (Space Grotesk) */}
				<h1 className='font-heading text-5xl font-bold tracking-tight text-white sm:text-7xl uppercase max-w-4xl leading-none'>
					Autonomous Infrastructure For{' '}
					<span className='text-transparent bg-clip-text bg-linear-to-r from-zinc-100 via-zinc-400 to-zinc-600'>
						Business Scheduling
					</span>
				</h1>

				{/* OPIS - Koristi čitljivi Inter (font-sans) */}
				<p className='mt-8 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-2xl font-sans tracking-wide'>
					Scale your operation with an automated, multi-tenant scheduling
					engine. Orchestrate team availability, process global payments via
					Stripe, and access deep analytical insights out of the box.
				</p>

				<div className='mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto'>
					<Button
						asChild
						size='lg'
						className='bg-white hover:bg-zinc-200 text-black font-sans text-sm font-semibold rounded-none px-8 w-full sm:w-auto h-12 transition-all'>
						<Link href='/register'>Deploy Platform</Link>
					</Button>

					<Button
						asChild
						size='lg'
						variant='outline'
						className='border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-sans text-sm font-semibold rounded-none px-8 w-full sm:w-auto h-12'>
						<Link href='#features'>Read Docs</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
