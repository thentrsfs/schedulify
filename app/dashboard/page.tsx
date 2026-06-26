import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
	// 1. Read session on the server
	const user = await currentUser();

	if (!user) {
		redirect('/sign-in');
	}

	// 2. Fetch user and their businesses from Neon database
	let dbUser = await db.user.findUnique({
		where: { id: user.id },
		include: {
			ownedBusinesses: true,
		},
	});

	// 🚀 LOCAL BYPASS: If user exists in Clerk but not in Neon (or ID mismatched), auto-create/sync it
	if (!dbUser) {
		const primaryEmail = user.emailAddresses[0]?.emailAddress;

		dbUser = await db.user.create({
			data: {
				id: user.id,
				email: primaryEmail,
				name:
					`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
					'Anonymous User',
				role: 'OWNER', // Defaulting to OWNER so you can access tenant registration
			},
			include: {
				ownedBusinesses: true,
			},
		});
	}

	// 3. Evaluate infrastructure state
	const hasNoBusiness = dbUser.ownedBusinesses.length === 0;

	return (
		<div className='w-full h-full bg-[#09090b] lg:py-8 font-sans'>
			<div className='max-w-7xl mx-auto'>
				{/* DASHBOARD HEADER */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-8 mb-8'>
					<div>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{`[ status: active_session // node_role: ${dbUser.role} ]`}
						</span>
						<h1 className='font-heading text-3xl font-bold tracking-tight text-white uppercase mt-1'>
							Command Center
						</h1>
					</div>

					{/* Sign Out Trigger */}
					<SignOutButton redirectUrl='/'>
						<Button
							variant='outline'
							className='border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider rounded-none h-10'>
							Terminate Session
						</Button>
					</SignOutButton>
				</div>

				{/* CONDITION: NO BUSINESS IN INFRASTRUCTURE */}
				{hasNoBusiness ? (
					<div className='w-full border border-dashed border-zinc-800 bg-[#0c0c0e] p-8 lg:p-16 text-center flex flex-col items-center justify-center'>
						<span className='font-mono text-xs uppercase tracking-widest text-amber-500 mb-2'>
							{`[ alert: no_active_tenant_detected ]`}
						</span>
						<h2 className='text-xl md:text-2xl font-bold uppercase tracking-tight text-white max-w-md'>
							Your Command Center is currently offline
						</h2>
						<p className='mt-3 text-zinc-400 text-sm max-w-lg font-light leading-relaxed'>
							To activate metrics engines, scheduling matrices, and financial
							nodes, you must register your business infrastructure first.
						</p>

						<Link
							href='/dashboard/onboarding'
							className='mt-8'>
							<Button className='bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 px-6'>
								Initialize New Tenant [Onboarding]
							</Button>
						</Link>
					</div>
				) : (
					/* CONDITION: CORE SYSTEMS LIVE */
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 pb-6'>
						{/* Identity Card */}
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

						{/* Metrics Engine Card */}
						<div className='bg-[#0c0c0e] border border-zinc-900 p-6 rounded-none flex flex-col justify-between'>
							<div>
								<span className='font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-4'>
									[ metrics_engine ]
								</span>
								<h4 className='text-zinc-400 text-sm font-medium'>
									Registered Businesses
								</h4>
								<p className='font-heading text-4xl font-bold text-white mt-2'>
									{dbUser.ownedBusinesses.length}
								</p>
							</div>
							<div className='text-[11px] font-mono text-zinc-600 mt-4'>
								{'[ engine_status: core_hub_operational ]'}
							</div>
						</div>

						{/* Financial Node Card */}
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
				)}
			</div>
		</div>
	);
}
