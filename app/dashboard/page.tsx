import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { db } from '@/lib/db'; // <-- Uvozimo tvoju spremnu Prismu

export default async function DashboardPage() {
	// 1. Čitamo sesiju na serveru
	const user = await currentUser();

	if (!user) {
		redirect('/sign-in');
	}

	// 2. Vučemo korisnika i njegove biznise iz Neon baze
	const dbUser = await db.user.findUnique({
		where: { id: user.id },
		include: {
			ownedBusinesses: true,
		},
	});

	// Fallback ako webhook još uvek nije procesovao upis
	if (!dbUser) {
		return (
			<div className='w-full min-h-[calc(100vh-4rem)] bg-[#09090b] flex items-center justify-center'>
				<span className='font-mono text-xs uppercase tracking-widest text-zinc-500 animate-pulse'>
					[ synchronizing_database_profile... ]
				</span>
			</div>
		);
	}

	// 3. Provera uloge i biznisa za OWNER-a
	if (dbUser.role === 'OWNER' && dbUser.ownedBusinesses.length === 0) {
		redirect('/dashboard/onboarding');
	}

	return (
		<div className='w-full min-h-[calc(100vh-4rem)] bg-[#09090b] p-6 lg:p-12 font-sans'>
			<div className='max-w-7xl mx-auto'>
				{/* ZAGLAVLJE DASHBOARD-A */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-8 mb-8'>
					<div>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{`[ status: active_session // role: ${dbUser.role} ]`}
						</span>
						<h1 className='font-heading text-3xl font-bold tracking-tight text-white uppercase mt-1'>
							Command Center
						</h1>
					</div>

					{/* Dugme za odjavu */}
					<SignOutButton redirectUrl='/'>
						<Button
							variant='outline'
							className='border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-none h-10'>
							Terminate Session
						</Button>
					</SignOutButton>
				</div>

				{/* KORISNIČKI PROFIL (INFORMACIJE IZ CLERK-A + NAŠE BAZE) */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{/* Kartica sa podacima korisnika */}
					<div className='bg-[#0c0c0e] border border-zinc-900 p-6 rounded-none flex flex-col justify-between'>
						<div>
							<span className='font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-4'>
								[ identity_data ]
							</span>

							<div className='flex items-center gap-4 mb-6'>
								{user.imageUrl && (
									<Image
										src={user.imageUrl}
										alt='Profile'
										width={48}
										height={48}
										className='w-12 h-12 rounded-none border border-zinc-800 object-cover'
										priority
									/>
								)}
								<div>
									<h3 className='font-heading font-medium text-white text-base'>
										{dbUser.name || 'Anonymous User'}
									</h3>
									<p className='text-xs text-zinc-500 font-mono'>
										ID: {dbUser.id.substring(0, 12)}...
									</p>
								</div>
							</div>

							<div className='space-y-2 border-t border-zinc-900 pt-4'>
								<div className='flex justify-between text-xs'>
									<span className='text-zinc-500 font-mono'>EMAIL:</span>
									<span className='text-zinc-300 font-medium'>
										{dbUser.email}
									</span>
								</div>
								<div className='flex justify-between text-xs'>
									<span className='text-zinc-500 font-mono'>ROLE:</span>
									<span className='text-emerald-400 font-mono uppercase text-[10px] tracking-wider'>
										[ {dbUser.role} ]
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Kartica za metrike (Prikazuje "Awaiting onboarding" ako je OWNER bez biznisa) */}
					<div className='bg-[#0c0c0e] border border-zinc-900 p-6 rounded-none flex flex-col justify-between'>
						<div>
							<span className='font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-4'>
								[ metrics_engine ]
							</span>
							<h4 className='text-zinc-400 text-sm font-medium'>
								{dbUser.role === 'OWNER'
									? 'Registered Businesses'
									: 'Total Appointments'}
							</h4>
							<p className='font-heading text-4xl font-bold text-white mt-2'>
								{dbUser.role === 'OWNER' ? dbUser.ownedBusinesses.length : 0}
							</p>
						</div>
						<div className='text-[11px] font-mono text-zinc-600 mt-4'>
							{dbUser.role === 'OWNER'
								? '[ engine_status: core_hub_operational ]'
								: '[ engine_status: awaiting_data_flow ]'}
						</div>
					</div>

					{/* Kartica za finansije */}
					<div className='bg-[#0c0c0e] border border-zinc-900 p-6 rounded-none flex flex-col justify-between'>
						<div>
							<span className='font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-4'>
								[ financial_node ]
							</span>
							<h4 className='text-zinc-400 text-sm font-medium'>
								Revenue (MTD)
							</h4>
							<p className='font-heading text-4xl font-bold text-white mt-2'>
								$0.00
							</p>
						</div>
						<div className='text-[11px] font-mono text-zinc-600 mt-4'>
							{'[ core_requirement: stripe_integration ]'}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
