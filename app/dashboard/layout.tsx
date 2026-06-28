import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

import SidebarContent from '@/components/SidebarContent';
import { MobileMenu } from '@/components/MobileMenu';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// 1. Uzmi userId trenutno ulogovanog korisnika iz Clerka
	const { userId } = await auth();

	// 2. Pronađi njegov biznis na osnovu ownerId polja
	const business = await db.business.findFirst({
		where: {
			ownerId: userId as string,
		},
	});

	return (
		<div className='flex min-h-0 h-full bg-[#09090b] text-white font-sans selection:bg-emerald-500 selection:text-zinc-950'>
			{/* SIDEBAR NAVIGACIJA (DESKTOP) */}
			<aside className='w-64 hidden md:flex border-r border-zinc-900 bg-[#0c0c0e] flex-col justify-between shrink-0 h-full sticky top-0'>
				{/* 🌟 Prosleđujemo business u desktop verziju */}
				<SidebarContent business={business} />
			</aside>

			<div className='flex-1 flex flex-col min-h-0 h-full w-full'>
				{/* MOBILNI HEADER */}
				<header className='flex h-14 items-center border-b border-zinc-900 px-4 md:hidden shrink-0 bg-[#0c0c0e]'>
					<MobileMenu>
						{/* 🌟 Prosleđujemo business i u mobilnu verziju menija */}
						<SidebarContent business={business} />
					</MobileMenu>
				</header>

				{/* GLAVNI SADRŽAJ STRANICE */}
				<main className='flex-1 overflow-y-auto min-h-0 h-full w-full p-6'>
					{children}
				</main>
			</div>
		</div>
	);
}
