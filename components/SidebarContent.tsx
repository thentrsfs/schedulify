import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
// 🌟 Uvoz pravog tipa iz Prisme da nemamo 'any'
import { Business } from '@prisma/client';

interface SidebarContentProps {
	business: Business | null;
}

const SidebarContent = ({ business }: SidebarContentProps) => {
	// Ako je business null (npr. novi korisnik bez profila), fallback sprečava pucanje koda
	const slug = business?.slug || 'alpha-cyber-salon';

	return (
		<>
			<div className='space-y-8 '>
				{/* LOGO SEKCIJA */}
				<div className='border-b border-zinc-700 p-6'>
					<span className='font-mono text-xs uppercase tracking-widest text-zinc-500 block'>
						{'[ system_core ]'}
					</span>
					<Link
						href='/dashboard'
						className='font-heading text-xl font-bold tracking-tight text-white uppercase mt-1 block hover:text-emerald-400 transition-colors'>
						Schedulify
					</Link>
				</div>

				{/* LINKOVI */}
				<nav className='flex flex-col space-y-2 px-6 pb-6'>
					<span className='font-mono text-[10px] uppercase tracking-widest text-zinc-600 block mb-2 '>
						[// Navigation_nodes]
					</span>

					<Link
						href='/dashboard'
						className='font-mono text-xs uppercase tracking-wider px-3 py-3 rounded-none border border-transparent hover:border-zinc-800 hover:bg-[#09090b] text-zinc-400 hover:text-white transition-all block'>
						[01] Main Command
					</Link>

					<Link
						href='/dashboard/services'
						className='font-mono text-xs uppercase tracking-wider px-3 py-3 rounded-none border border-transparent hover:border-zinc-800 hover:bg-[#09090b] text-zinc-400 hover:text-white transition-all block'>
						[02] Service Registry
					</Link>

					<Link
						href='/dashboard/staff'
						className='font-mono text-xs uppercase tracking-wider px-3 py-3 rounded-none border border-transparent hover:border-zinc-800 hover:bg-[#09090b] text-zinc-400 hover:text-white transition-all block'>
						[03] Employee Registry
					</Link>

					<Link
						href='/dashboard/appointments'
						className='font-mono text-xs uppercase tracking-wider px-3 py-3 rounded-none border border-transparent hover:border-zinc-800 hover:bg-[#09090b] text-zinc-400 hover:text-white transition-all block'>
						[04] Appointment Matrix
					</Link>
				</nav>
			</div>

			{/* DONJA SEKCIJA SIDEBARA */}
			<div className='border-t border-zinc-700 p-6 flex flex-col gap-3'>
				{/* 🔗 DUGME KOJE VODI NA STRANICU ZA ZAKAZIVANJE */}
				<Link
					href={`/book/${slug}`}
					className='w-full block'>
					<Button
						variant='outline'
						className='w-full border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-none h-10 transition-colors'>
						[ View Booking Page ]
					</Button>
				</Link>

				{/* 🔒 LOGOUT DUGME */}
				<SignOutButton redirectUrl='/'>
					<Button
						variant='outline'
						className='w-full border-zinc-800 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 font-mono text-xs uppercase tracking-wider rounded-none h-10 transition-colors'>
						Terminate Session
					</Button>
				</SignOutButton>
			</div>
		</>
	);
};

export default SidebarContent;
