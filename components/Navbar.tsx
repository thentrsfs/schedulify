import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Navbar() {
	return (
		<header className='sticky top-0 z-50 w-full border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md'>
			<div className='container flex h-16 items-center justify-between max-w-7xl mx-auto px-4'>
				{/* LOGO - Koristi font-heading (Space Grotesk) za prepoznatljiv brending */}
				<div className='flex items-center gap-2'>
					<Link
						href='/'
						className='flex items-center space-x-2'>
						<span className='font-heading font-bold text-xl tracking-tight text-white uppercase'>
							SCHEDULIFY<span className='text-emerald-400'>.</span>
						</span>
					</Link>
				</div>

				{/* NAV LINKOVI - Čist Inter (font-sans) sa suptilnim stilom */}
				<nav className='hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400 font-sans'>
					<Link
						href='#features'
						className='transition-colors hover:text-white tracking-wide'>
						Features
					</Link>
					<Link
						href='#pricing'
						className='transition-colors hover:text-white tracking-wide'>
						Pricing
					</Link>
					<Link
						href='#docs'
						className='transition-colors hover:text-white tracking-wide'>
						Docs
					</Link>
				</nav>

				{/* AKCIJE DUGMADI - Savršeno oštre ivice i jasan kontrast */}
				<div className='flex items-center gap-6 font-sans'>
					<Link
						href='/login'
						className='text-sm font-medium text-zinc-400 transition-colors hover:text-white hidden sm:block tracking-wide'>
						Sign In
					</Link>
					<Button
						asChild
						className='bg-white hover:bg-zinc-200 text-black font-sans text-xs uppercase tracking-wider font-bold rounded-none px-5 h-9 transition-all border border-transparent hover:border-emerald-400'>
						<Link href='/register'>Create Tenant</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
