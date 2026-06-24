import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BookPageProps {
	params: Promise<{
		businessSlug: string;
	}>;
}

export default async function PublicBookingPage({ params }: BookPageProps) {
	const { businessSlug } = await params;

	// 1. Vučemo biznis preko slug-a zajedno sa njegovim uslugama i operativcima
	const business = await db.business.findFirst({
		where: { slug: businessSlug },
		include: {
			services: true,
			employees: {
				include: { user: true },
			},
		},
	});

	// Ako biznis sa tim slug-om ne postoji u bazi, bacamo 404
	if (!business) {
		notFound();
	}

	// Sačuvaj ID u lokalnu konstantu da bi server action imao siguran, non-null vrednost
	const businessId = business.id;

	// SERVER ACTION ZA KLIJENTSKO ZAKAZIVANJE
	async function handleClientBooking(formData: FormData) {
		'use server';

		const serviceId = formData.get('serviceId') as string;
		const employeeId = formData.get('employeeId') as string;
		const dateStr = formData.get('date') as string; // YYYY-MM-DD
		const timeStr = formData.get('time') as string; // HH:MM
		const clientEmail = formData.get('email') as string;
		const clientName = formData.get('name') as string;
		const notes = formData.get('notes') as string;

		if (!serviceId || !employeeId || !dateStr || !timeStr || !clientEmail)
			return;

		// Tražimo da li klijent sa tim emailom već postoji u bazi
		let customer = await db.user.findFirst({
			where: { email: clientEmail },
		});

		// Ako ne postoji, kreiramo novog bazičnog korisnika da bismo imali validan customerId
		if (!customer) {
			customer = await db.user.create({
				data: {
					email: clientEmail,
					name: clientName || 'Anonymous Client',
				},
			});
		}

		const startTime = new Date(`${dateStr}T${timeStr}:00`);

		const selectedService = await db.service.findUnique({
			where: { id: serviceId },
		});
		if (!selectedService) return;

		const endTime = new Date(
			startTime.getTime() + selectedService.duration * 60000,
		);

		// Upisujemo termin direktno u bazu povezanu sa ovim biznisom
		await db.appointment.create({
			data: {
				businessId, // sigurni non-null ID snimljen iznad
				customerId: customer.id,
				employeeId,
				serviceId,
				startTime,
				endTime,
				notes: notes || null,
				status: 'PENDING', // Čeka odobrenje admina na dashboardu
			},
		});

		// Čistimo keš za admin rute kako bi odmah videli novi zahtev
		revalidatePath('/dashboard/appointments');

		// Ovde bismo u realnosti radili redirect na /book/[businessSlug]/success,
		// ali za sada samo osvežavamo formu radi provere
		revalidatePath(`/book/${businessSlug}`);
	}

	return (
		/* ⚡ Tvoj pt-12 stil ostaje zakucan i ovde za vizuelni kontinuitet */
		<div className='w-full min-h-screen pt-12 bg-[#09090b] font-sans text-white flex items-center justify-center px-4'>
			<div className='max-w-md w-full border border-zinc-900 bg-[#0c0c0e] p-8 space-y-6'>
				<div className='space-y-1 text-center border-b border-zinc-900 pb-6'>
					<span className='font-mono text-xs uppercase tracking-widest text-emerald-400 block mb-1'>
						{`[ terminal: secure_booking_portal ]`}
					</span>
					<h1 className='text-2xl font-bold uppercase tracking-tight'>
						{business.name}
					</h1>
					<p className='text-xs text-zinc-500 font-mono'>
						Select your mission specs and deploy request.
					</p>
				</div>

				<form
					action={handleClientBooking}
					className='space-y-4'>
					{/* CLIENT IDENTITY */}
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Your Name
							</label>
							<Input
								name='name'
								required
								placeholder='John Doe'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
							/>
						</div>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Email Address
							</label>
							<Input
								type='email'
								name='email'
								required
								placeholder='john@example.com'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
							/>
						</div>
					</div>

					{/* SERVICE SELECTION */}
					<div className='space-y-2'>
						<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
							Select Service
						</label>
						<select
							name='serviceId'
							required
							className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e] [&>option]:text-white'>
							<option value=''>Choose an operation...</option>
							{business.services.map((s) => (
								<option
									key={s.id}
									value={s.id}>
									{s.name} — {s.price}.00 RSD ({s.duration} min)
								</option>
							))}
						</select>
					</div>

					{/* EMPLOYEE SELECTION */}
					<div className='space-y-2'>
						<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
							Preferred Operator
						</label>
						<select
							name='employeeId'
							required
							className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e] [&>option]:text-white'>
							<option value=''>Select professional agent...</option>
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
								Target Date
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
								Target Time
							</label>
							<Input
								type='time'
								name='time'
								required
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
							/>
						</div>
					</div>

					{/* EXTRA DETAILS */}
					<div className='space-y-2'>
						<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
							Additional Specs (Optional)
						</label>
						<Input
							name='notes'
							placeholder='Any specific instructions...'
							className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
						/>
					</div>

					<Button
						type='submit'
						className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 mt-4'>
						Transmit Booking Request
					</Button>
				</form>
			</div>
		</div>
	);
}
