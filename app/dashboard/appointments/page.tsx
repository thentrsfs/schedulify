import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function AppointmentsPage() {
	const user = await currentUser();
	if (!user) redirect('/sign-in');

	// Vučemo biznis, njegove usluge, zaposlene, i sve dosadašnje termine
	const business = await db.business.findFirst({
		where: { ownerId: user.id },
		include: {
			services: true,
			employees: { include: { user: true } },
			appointments: {
				include: {
					customer: true,
					service: true,
					employee: { include: { user: true } },
				},
				orderBy: { startTime: 'asc' },
			},
		},
	});

	if (!business) redirect('/dashboard/onboarding');

	// Vučemo sve registrovane korisnike u sistemu da bismo mogli da izaberemo klijenta za test
	const allUsers = await db.user.findMany();

	// SERVER ACTION ZA KREIRANJE TERMINA
	async function createAppointment(formData: FormData) {
		'use server';

		const customerId = formData.get('customerId') as string;
		const serviceId = formData.get('serviceId') as string;
		const employeeId = formData.get('employeeId') as string;
		const dateStr = formData.get('date') as string; // YYYY-MM-DD
		const timeStr = formData.get('time') as string; // HH:MM
		const notes = formData.get('notes') as string;

		if (!customerId || !serviceId || !employeeId || !dateStr || !timeStr)
			return;

		// Konstruišemo tačan startTime objekat
		const startTime = new Date(`${dateStr}T${timeStr}:00`);

		// Vučemo podatke o usluzi da bismo videli koliko traje (duration)
		const selectedService = await db.service.findUnique({
			where: { id: serviceId },
		});
		if (!selectedService) return;

		// Računamo endTime na osnovu trajanja usluge (dodajemo minute na startTime)
		const endTime = new Date(
			startTime.getTime() + selectedService.duration * 60000,
		);

		const authUser = await currentUser();
		const currentBusiness = await db.business.findFirst({
			where: { ownerId: authUser?.id },
		});
		if (!currentBusiness) return;

		// Upisujemo Appointment direktno u bazu
		await db.appointment.create({
			data: {
				businessId: currentBusiness.id,
				customerId,
				employeeId,
				serviceId,
				startTime,
				endTime,
				notes: notes || null,
				status: 'PENDING', // Po defaultu iz tvoje sheme
			},
		});

		redirect('/dashboard/appointments');
	}

	return (
		<div className='w-full min-h-[calc(100vh-4rem)] bg-[#09090b] p-6 lg:p-12 font-sans text-white'>
			<div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* FORMA ZA REZERVACIJU */}
				<div className='border border-zinc-900 bg-[#0c0c0e] p-6 h-fit'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{'[ node: appointment_scheduler ]'}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Zakaži Termin
						</h2>
					</div>

					<form
						action={createAppointment}
						className='space-y-4'>
						{/* IZBOR KLIJENTA */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Klijent
							</label>
							<select
								name='customerId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500'>
								<option value=''>Izaberi klijenta...</option>
								{allUsers.map((u) => (
									<option
										key={u.id}
										value={u.id}>
										{u.name || u.email}
									</option>
								))}
							</select>
						</div>

						{/* IZBOR USLUGE */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Usluga
							</label>
							<select
								name='serviceId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500'>
								<option value=''>Izaberi uslugu...</option>
								{business.services.map((s) => (
									<option
										key={s.id}
										value={s.id}>
										{s.name} ({s.duration} min)
									</option>
								))}
							</select>
						</div>

						{/* IZBOR ZAPOSLENOG */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Zaposleni
							</label>
							<select
								name='employeeId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500'>
								<option value=''>Dodeli zaposlenog...</option>
								{business.employees.map((e) => (
									<option
										key={e.id}
										value={e.id}>
										{e.user?.name || 'Operativac'}
									</option>
								))}
							</select>
						</div>

						{/* DATUM I VREME */}
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
									Datum
								</label>
								<Input
									type='date'
									name='date'
									required
									className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
								/>
							</div>
							<div className='space-y-2'>
								<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
									Vreme
								</label>
								<Input
									type='time'
									name='time'
									required
									className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
								/>
							</div>
						</div>

						{/* NAPOMENA */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Napomena (Opciono)
							</label>
							<Input
								name='notes'
								placeholder='Dodatni zahtevi klijenta...'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
							/>
						</div>

						<Button
							type='submit'
							className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 mt-2'>
							Commit Booking To Matrix
						</Button>
					</form>
				</div>

				{/* PREGLED ZAKAZANIH TERMINA */}
				<div className='lg:col-span-2 border border-zinc-900 bg-[#0c0c0e] p-6'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-zinc-500'>
							{`[ scheduled_appointments // count: ${business.appointments?.length || 0} ]`}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Aktivni Termini
						</h2>
					</div>

					{business.appointments?.length === 0 ? (
						<div className='text-center py-12 border border-dashed border-zinc-900 font-mono text-xs text-zinc-600'>
							{'[ status: clear_schedule // no_upcoming_events ]'}
						</div>
					) : (
						<div className='space-y-4'>
							{business.appointments?.map((app) => (
								<div
									key={app.id}
									className='border border-zinc-900 bg-[#09090b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4'>
									<div className='space-y-1'>
										<div className='flex items-center gap-2'>
											<span className='text-emerald-400 font-bold text-sm font-mono'>
												{new Date(app.startTime).toLocaleTimeString('sr-RS', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
											<span className='text-zinc-600 font-mono text-[10px]'>
												-{' '}
												{new Date(app.endTime).toLocaleTimeString('sr-RS', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
											<span className='text-zinc-500 font-mono text-xs ml-2'>
												[{new Date(app.startTime).toLocaleDateString('sr-RS')}]
											</span>
										</div>
										<h3 className='font-medium text-white text-base'>
											{app.service.name}
										</h3>
										<p className='text-xs text-zinc-400'>
											Klijent:{' '}
											<span className='text-zinc-200 font-medium'>
												{app.customer.name || app.customer.email}
											</span>
										</p>
										<p className='text-[11px] text-zinc-500'>
											Izvršilac:{' '}
											<span className='text-zinc-400 font-mono'>
												{app.employee.user?.name}
											</span>
										</p>
										{app.notes && (
											<p className='text-[11px] text-amber-500/80 italic font-mono mt-1'>
												* Note: {app.notes}
											</p>
										)}
									</div>

									<div className='flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0'>
										<span className='text-emerald-400 font-mono text-xs font-bold'>
											{app.service.price}.00 RSD
										</span>
										<span className='font-mono text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 text-emerald-400 uppercase tracking-wider'>
											{app.status}
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
