import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache'; // 🚀 Dodato za trenutno osvežavanje liste
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function ServicesPage() {
	const user = await currentUser();
	if (!user) redirect('/login'); // Usklađeno sa tvojom novom rutom za login

	// Vučemo biznis za potrebe renderovanja stranice
	const business = await db.business.findFirst({
		where: { ownerId: user.id },
		include: { services: true },
	});

	if (!business) redirect('/dashboard/onboarding');

	// Server Action za dodavanje nove usluge
	async function addService(formData: FormData) {
		'use server';

		const name = formData.get('name') as string;
		const priceStr = formData.get('price') as string;
		const durationStr = formData.get('duration') as string;

		if (!name || !priceStr || !durationStr) return;

		const authUser = await currentUser();
		if (!authUser) return;

		const currentBusiness = await db.business.findFirst({
			where: { ownerId: authUser.id },
		});

		if (!currentBusiness) return;

		await db.service.create({
			data: {
				name: name,
				price: parseFloat(priceStr),
				duration: parseInt(durationStr),
				businessId: currentBusiness.id,
			},
		});

		// 🚀 Čistimo keš za usluge tako da desna kolona odmah prikaže novu uslugu na klik!
		revalidatePath('/dashboard/services');
	}

	return (
		/* 🚀 Zamenjeno min-h-[calc(100vh-4rem)] sa min-h-full da se uklopi u novi layout */
		<div className='w-full min-h-full pt-12 bg-[#09090b] font-sans text-white'>
			<div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* LEVA STRANA: FORMA ZA DODAVANJE */}
				<div className='border border-zinc-900 bg-[#0c0c0e] p-6 h-fit'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{'[ node: service_registry ]'}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Add New Service
						</h2>
					</div>

					<form
						action={addService}
						className='space-y-4'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Service Name
							</label>
							<Input
								name='name'
								required
								placeholder='e.g. Haircut'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-sm'
							/>
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
									Price (EUR)
								</label>
								<Input
									name='price'
									type='number'
									required
									placeholder='20'
									className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-sm'
								/>
							</div>
							<div className='space-y-2'>
								<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
									Duration (min)
								</label>
								<Input
									name='duration'
									type='number'
									required
									placeholder='30'
									className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-sm'
								/>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-10 mt-2'>
							Register Service Node
						</Button>
					</form>
				</div>

				{/* DESNA STRANA: PREGLED POSTOJEĆIH USLUGA */}
				<div className='lg:col-span-2 border border-zinc-900 bg-[#0c0c0e] p-6'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-zinc-500'>
							{`[ active_services // count: ${business.services?.length || 0} ]`}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Service Menus & Catalogs
						</h2>
					</div>

					{business.services?.length === 0 ? (
						<div className='text-center py-12 border border-dashed border-zinc-900 font-mono text-xs text-zinc-600'>
							{'[ status: empty_catalog // awaiting_initial_data ]'}
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{business.services?.map((service) => (
								<div
									key={service.id}
									className='border border-zinc-900 bg-[#09090b] p-4 flex flex-col justify-between'>
									<div>
										<h3 className='font-medium text-white text-base'>
											{service.name}
										</h3>
										<p className='text-xs text-zinc-500 font-mono mt-1'>
											Duration: {service.duration} min
										</p>
									</div>
									<div className='flex justify-between items-center border-t border-zinc-900 pt-3 mt-4'>
										<span className='text-emerald-400 font-mono text-sm font-bold'>
											{service.price}.00 EUR
										</span>
										<span className='font-mono text-[9px] text-zinc-600 uppercase'>
											{'[ active ]'}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
