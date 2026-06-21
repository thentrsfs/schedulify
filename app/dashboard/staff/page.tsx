import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function StaffPage() {
	const user = await currentUser();
	if (!user) redirect('/sign-in');

	// 1. Vučemo biznis i njegove zaposlene (relacija se kod tebe zove 'employees')
	// Takođe uključujemo 'user' podatke za svakog zaposlenog da bismo znali ime i email
	const business = await db.business.findFirst({
		where: { ownerId: user.id },
		include: {
			employees: {
				include: {
					user: true,
				},
			},
		},
	});

	if (!business) redirect('/dashboard/onboarding');

	async function addStaff(formData: FormData) {
		'use server';

		const employeeUserId = formData.get('userId') as string; // Tražimo User ID za radnika

		if (!employeeUserId) return;

		const authUser = await currentUser();
		const currentBusiness = await db.business.findFirst({
			where: { ownerId: authUser?.id },
		});

		if (!currentBusiness) return;

		// 2. Upisujemo radnika u tabelu Employee
		await db.employee.create({
			data: {
				userId: employeeUserId,
				businessId: currentBusiness.id,
				// workingHours može ostati prazan za sada jer je opcion (Json?)
			},
		});

		redirect('/dashboard/staff');
	}

	return (
		<div className='w-full min-h-[calc(100vh-4rem)] bg-[#09090b] p-6 lg:p-12 font-sans text-white'>
			<div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* FORMA ZA REGISTRACIJU RADNIKA */}
				<div className='border border-zinc-900 bg-[#0c0c0e] p-6 h-fit'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{'[ node: employee_registry ]'}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Dodaj Zaposlenog
						</h2>
					</div>

					<form
						action={addStaff}
						className='space-y-4'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								User ID zaposlenog
							</label>
							<Input
								name='userId'
								required
								placeholder='Unesi korisnički ID iz baze (user_...)'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
							/>
							<span className='text-[10px] text-zinc-600 font-mono block mt-1'>
								* Trenutno spajamo preko ID-ja korisnika koji već postoji u
								sistemu.
							</span>
						</div>

						<Button
							type='submit'
							className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 mt-2'>
							Deploy Employee Node
						</Button>
					</form>
				</div>

				{/* LISTA AKTIVNIH RADNIKA */}
				<div className='lg:col-span-2 border border-zinc-900 bg-[#0c0c0e] p-6'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-zinc-500'>
							{`[ active_employees // count: ${business.employees?.length || 0} ]`}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Personalni Registar
						</h2>
					</div>

					{business.employees?.length === 0 ? (
						<div className='text-center py-12 border border-dashed border-zinc-900 font-mono text-xs text-zinc-600'>
							{'[ status: empty_database // awaiting_employee_link ]'}
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{business.employees?.map((employee) => (
								<div
									key={employee.id}
									className='border border-zinc-900 bg-[#09090b] p-4 flex items-center gap-4'>
									<div className='w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold'>
										[E]
									</div>
									<div>
										{/* Pošto smo inkludovali 'user', čitamo njegovo stvarno ime i email */}
										<h3 className='font-medium text-white text-base'>
											{employee.user?.name || 'Korisnik'}
										</h3>
										<p className='text-[10px] text-zinc-500 font-mono truncate max-w-50'>
											{employee.user?.email}
										</p>
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
