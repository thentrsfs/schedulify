import SidebarContent from '@/components/SidebarContent';
import { MobileMenu } from '@/components/MobileMenu';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex min-h-0 h-full bg-[#09090b] text-white font-sans selection:bg-emerald-500 selection:text-zinc-950'>
			{/* SIDEBAR NAVIGACIJA */}
			<aside className='w-64 hidden md:flex border-r border-zinc-900 bg-[#0c0c0e] flex-col justify-between shrink-0 h-full sticky top-0'>
				<SidebarContent />
			</aside>

			<div className='flex-1 flex flex-col min-h-0 h-full w-full'>
				{/* MOBILNI HEADER */}
				<header className='flex h-14 items-center border-b border-zinc-900 px-4 md:hidden shrink-0 bg-[#0c0c0e]'>
					<MobileMenu>
						<SidebarContent />
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
