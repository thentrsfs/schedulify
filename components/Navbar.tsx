import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

export default async function Navbar() {
	// 1. Proveravamo sesiju uživo na serveru
	const { userId } = await auth();

	return (
		<header className='sticky top-0 z-50 w-full border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md shrink-0'>
			<div className='container flex h-16 items-center justify-between max-w-7xl mx-auto px-6'>
				{/* LOGO */}
				<div className='flex items-center gap-2'>
					<Link
						href='/'
						className='flex items-center space-x-2'>
						<span className='font-heading font-bold text-xl tracking-tight text-white uppercase'>
							SCHEDULIFY<span className='text-emerald-400'>.</span>
						</span>
					</Link>
				</div>

				{/* NAV LINKOVI */}
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

				{/* DINAMIČKE AKCIJE DUGMADI */}
				<div className='flex items-center gap-4 font-sans'>
					{/* ❌ AKO KORISNIK NIJE ULOGOVAN (userId je null) */}
					{!userId ? (
						<>
							<Link
								href='/login'
								className='text-sm font-medium text-zinc-400 transition-colors hover:text-white hidden sm:block tracking-wide mr-2'>
								Sign In
							</Link>
							<Button
								asChild
								className='bg-white hover:bg-zinc-200 text-black font-sans text-xs uppercase tracking-wider font-bold rounded-none px-5 h-9 transition-all border border-transparent hover:border-emerald-400'>
								<Link href='/register'>Create Tenant</Link>
							</Button>
						</>
					) : (
						/* 🚀 AKO JE KORISNIK ULOGOVAN */
						<>
							<Link href='/dashboard'>
								<Button
									variant='outline'
									className='border-zinc-800 bg-zinc-900 text-white font-mono text-xs uppercase tracking-wider rounded-none h-9 px-4 hover:bg-zinc-800 hover:text-white'>
									Dashboard
								</Button>
							</Link>
							<UserButton
								appearance={{
									elements: {
										avatarBox: 'w-9 h-9 rounded-none border border-zinc-800',
									},
								}}
							/>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
