import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function AppointmentsPage() {
	const user = await currentUser();
	if (!user) redirect('/login');

	// Fetch business, services, employees, and all related appointments
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

	const allUsers = await db.user.findMany();

	// 🚀 ACTION: CREATE APPOINTMENT
	async function createAppointment(formData: FormData) {
		'use server';

		const customerId = formData.get('customerId') as string;
		const serviceId = formData.get('serviceId') as string;
		const employeeId = formData.get('employeeId') as string;
		const dateStr = formData.get('date') as string;
		const timeStr = formData.get('time') as string;
		const notes = formData.get('notes') as string;

		if (!customerId || !serviceId || !employeeId || !dateStr || !timeStr)
			return;

		const startTime = new Date(`${dateStr}T${timeStr}:00`);

		const selectedService = await db.service.findUnique({
			where: { id: serviceId },
		});
		if (!selectedService) return;

		const endTime = new Date(
			startTime.getTime() + selectedService.duration * 60000,
		);

		const authUser = await currentUser();
		if (!authUser) return;

		const currentBusiness = await db.business.findFirst({
			where: { ownerId: authUser.id },
		});
		if (!currentBusiness) return;

		await db.appointment.create({
			data: {
				businessId: currentBusiness.id,
				customerId,
				employeeId,
				serviceId,
				startTime,
				endTime,
				notes: notes || null,
				status: 'PENDING',
			},
		});

		revalidatePath('/dashboard/appointments');
	}

	// 🚀 NEW ACTION: APPROVE APPOINTMENT
	async function approveAppointment(formData: FormData) {
		'use server';
		const appointmentId = formData.get('appointmentId') as string;
		if (!appointmentId) return;

		await db.appointment.update({
			where: { id: appointmentId },
			data: { status: 'CONFIRMED' },
		});

		revalidatePath('/dashboard/appointments');
	}

	// 🚀 NEW ACTION: CANCEL APPOINTMENT
	async function cancelAppointment(formData: FormData) {
		'use server';
		const appointmentId = formData.get('appointmentId') as string;
		if (!appointmentId) return;

		await db.appointment.update({
			where: { id: appointmentId },
			data: { status: 'CANCELLED' },
		});

		revalidatePath('/dashboard/appointments');
	}

	return (
		/* ⚡ Tvoj pt-12 i min-h-full ostaju fiksirani */
		<div className='w-full min-h-full pt-12 bg-[#09090b] font-sans text-white'>
			<div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* LEFT COLUMN: SCHEDULER FORM */}
				<div className='border border-zinc-900 bg-[#0c0c0e] p-6 h-fit'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{'[ node: appointment_scheduler ]'}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Book Appointment
						</h2>
					</div>

					<form
						action={createAppointment}
						className='space-y-4'>
						{/* CUSTOMER SELECTION */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Customer
							</label>
							<select
								name='customerId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e] [&>option]:text-white'>
								<option value=''>Select client...</option>
								{allUsers.map((u) => (
									<option
										key={u.id}
										value={u.id}>
										{u.name || u.email}
									</option>
								))}
							</select>
						</div>

						{/* SERVICE SELECTION */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Service
							</label>
							<select
								name='serviceId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e] [&>option]:text-white'>
								<option value=''>Select service...</option>
								{business.services.map((s) => (
									<option
										key={s.id}
										value={s.id}>
										{s.name} ({s.duration} min)
									</option>
								))}
							</select>
						</div>

						{/* EMPLOYEE SELECTION */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Operator
							</label>
							<select
								name='employeeId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e] [&>option]:text-white'>
								<option value=''>Assign employee...</option>
								{business.employees.map((e) => (
									<option
										key={e.id}
										value={e.id}>
										{e.user?.name || 'Field Agent'}
									</option>
								))}
							</select>
						</div>

						{/* DATE & TIME */}
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
									Date
								</label>
								<Input
									type='date'
									name='date'
									required
									className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
								/>
							</div>
							<div className='space-y-2'>
								<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
									Time
								</label>
								<Input
									type='time'
									name='time'
									required
									className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
								/>
							</div>
						</div>

						{/* NOTES */}
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Notes (Optional)
							</label>
							<Input
								name='notes'
								placeholder='Special requirements...'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
							/>
						</div>

						<Button
							type='submit'
							className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 mt-2'>
							Commit Booking To Matrix
						</Button>
					</form>
				</div>

				{/* RIGHT COLUMN: ACTIVE MATRIX OVERVIEW */}
				<div className='lg:col-span-2 border border-zinc-900 bg-[#0c0c0e] p-6'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-zinc-500'>
							{`[ scheduled_appointments // count: ${business.appointments?.length || 0} ]`}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Active Schedule Matrix
						</h2>
					</div>

					{business.appointments?.length === 0 ? (
						<div className='text-center py-12 border border-dashed border-zinc-900 font-mono text-xs text-zinc-600'>
							{'[ status: clear_schedule // no_upcoming_events ]'}
						</div>
					) : (
						<div className='space-y-4'>
							{business.appointments?.map((app) => {
								const timeStartRaw = app.startTime
									.toISOString()
									.substring(11, 16);
								const timeEndRaw = app.endTime.toISOString().substring(11, 16);
								const dateRaw = app.startTime.toISOString().substring(0, 10);

								// Dinamička boja za statuse
								const statusColors: Record<string, string> = {
									PENDING: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
									CONFIRMED:
										'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
									CANCELLED: 'text-rose-500 border-rose-500/30 bg-rose-500/5',
								};

								return (
									<div
										key={app.id}
										className='border border-zinc-900 bg-[#09090b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono'>
										<div className='space-y-1 min-w-0 flex-1'>
											<div className='flex items-center flex-wrap gap-2 text-xs'>
												<span className='text-emerald-400 font-bold'>
													{timeStartRaw}
												</span>
												<span className='text-zinc-600'>-</span>
												<span className='text-zinc-500'>{timeEndRaw}</span>
												<span className='text-zinc-400 ml-1 text-[11px]'>
													[{dateRaw}]
												</span>
											</div>
											<h3 className='font-medium text-white text-base truncate font-sans'>
												{app.service.name}
											</h3>
											<p className='text-xs text-zinc-400 truncate'>
												Client:{' '}
												<span className='text-zinc-200 font-medium font-sans'>
													{app.customer.name || app.customer.email}
												</span>
											</p>
											<p className='text-[11px] text-zinc-500 truncate'>
												Assigned Operator:{' '}
												<span className='text-zinc-400 font-sans'>
													{app.employee.user?.name || 'Field Agent'}
												</span>
											</p>
											{app.notes && (
												<p className='text-[11px] text-amber-500/80 italic mt-1 wrap-break-words max-w-xl'>
													* Mission Specs: {app.notes}
												</p>
											)}
										</div>

										{/* KONTROLE I STATUŠI */}
										<div className='flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 shrink-0 min-w-35'>
											<div className='text-right md:w-full'>
												<span className='text-emerald-400 text-sm font-bold block'>
													{app.service.price}.00 RSD
												</span>
												<span
													className={`inline-block text-[10px] px-2 py-0.5 border uppercase tracking-wider font-bold mt-1 ${statusColors[app.status] || 'text-zinc-400'}`}>
													{app.status}
												</span>
											</div>

											{/* Inline mini-forme za promenu stanja sačuvanih objekata */}
											{app.status === 'PENDING' && (
												<div className='flex gap-1.5'>
													<form action={approveAppointment}>
														<input
															type='hidden'
															name='appointmentId'
															value={app.id}
														/>
														<button
															type='submit'
															className='text-[10px] bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold uppercase tracking-tight px-2 py-1 rounded-none transitions-all'>
															Approve
														</button>
													</form>
													<form action={cancelAppointment}>
														<input
															type='hidden'
															name='appointmentId'
															value={app.id}
														/>
														<button
															type='submit'
															className='text-[10px] bg-zinc-900 hover:bg-rose-950 border border-zinc-800 hover:border-rose-900 text-zinc-400 hover:text-rose-400 uppercase tracking-tight px-2 py-1 rounded-none transitions-all'>
															Cancel
														</button>
													</form>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
