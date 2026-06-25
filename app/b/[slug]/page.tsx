import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PublicBookingProps {
	params: Promise<{
		slug: string;
	}>;
}

// 1. KOMPONENTA JE SADA POTPUNO ČISTA (Čita samo podatke i renderuje UI)
export default async function PublicBookingPage({
	params,
}: PublicBookingProps) {
	const { slug } = await params;
	const business = await db.business.findUnique({
		where: { slug: slug },
		include: {
			services: true,
			employees: { include: { user: true } },
		},
	});

	if (!business) {
		notFound();
	}

	return (
		<div className='w-full min-h-screen bg-[#09090b] text-white font-sans flex items-center justify-center p-4 lg:p-8'>
			<div className='w-full max-w-2xl border border-zinc-900 bg-[#0c0c0e] p-6 lg:p-10 rounded-none shadow-2xl'>
				<div className='space-y-2 mb-8 border-b border-zinc-900 pb-6 text-center lg:text-left'>
					<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
						{`[ terminal: ${business.slug} ]`}
					</span>
					<h1 className='text-3xl font-bold uppercase tracking-tight text-white mt-1'>
						{business.name}
					</h1>
				</div>

				{/* 🚀 Prosleđujemo Server Akciju koja je definisana van komponente, ali joj šaljemo businessId preko 'bind' */}
				<form
					action={handleClientBooking.bind(null, business.id)}
					className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-950 pb-6'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Your Full Name
							</label>
							<Input
								name='clientName'
								required
								placeholder='npr. Nikola Tesla'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-sm h-11'
							/>
						</div>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Your Email
							</label>
							<Input
								name='clientEmail'
								type='email'
								required
								placeholder='nikola@gmail.com'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-sm h-11'
							/>
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Choose a Service
							</label>
							<select
								name='serviceId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500'>
								<option value=''>-- Services --</option>
								{business.services.map(
									(s: (typeof business.services)[number]) => (
										<option
											key={s.id}
											value={s.id}>
											{s.name} ({s.price} RSD)
										</option>
									),
								)}
							</select>
						</div>

						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Choose an Expert
							</label>
							<select
								name='employeeId'
								required
								className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500'>
								<option value=''>-- Available Operators --</option>
								{business.employees.map(
									(e: (typeof business.employees)[number]) => (
										<option
											key={e.id}
											value={e.id}>
											{e.user?.name || 'Zaposleni'}
										</option>
									),
								)}
							</select>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4 border-t border-zinc-950 pt-4'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Date
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
								Time
							</label>
							<Input
								type='time'
								name='time'
								required
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
							Additional Notes
						</label>
						<Input
							name='notes'
							placeholder='Ako imate specifične zahteve...'
							className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
						/>
					</div>

					<Button
						type='submit'
						className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-12 transition-colors mt-4'>
						Request Secure Appointment
					</Button>
				</form>
			</div>
		</div>
	);
}

// 2. SERVER AKCIJA JE IZMEXTENA VAN KOMPONENTE (Sada je potpuno legalno koristiti Math.random ili UUID)
async function handleClientBooking(businessId: string, formData: FormData) {
	'use server';

	const serviceId = formData.get('serviceId') as string;
	const employeeId = formData.get('employeeId') as string;
	const dateStr = formData.get('date') as string;
	const timeStr = formData.get('time') as string;
	const clientName = formData.get('clientName') as string;
	const clientEmail = formData.get('clientEmail') as string;
	const notes = formData.get('notes') as string;

	if (
		!serviceId ||
		!employeeId ||
		!dateStr ||
		!timeStr ||
		!clientName ||
		!clientEmail
	)
		return;

	let customer = await db.user.findFirst({
		where: { email: clientEmail },
	});

	if (!customer) {
		customer = await db.user.create({
			data: {
				// Umesto Math.random, u pozadini možeš koristiti i čist crypto.randomUUID()
				id: `cust_${crypto.randomUUID().substring(0, 8)}`,
				email: clientEmail,
				name: clientName,
				role: 'CUSTOMER',
			},
		});
	}

	const startTime = new Date(`${dateStr}T${timeStr}:00`);
	const service = await db.service.findUnique({ where: { id: serviceId } });
	if (!service) return;
	const endTime = new Date(startTime.getTime() + service.duration * 60000);

	await db.appointment.create({
		data: {
			businessId: businessId, // Stiže bezbedno kroz bind
			customerId: customer.id,
			employeeId,
			serviceId,
			startTime,
			endTime,
			notes: notes || null,
			status: 'PENDING',
		},
	});

	// Pošto smo na javnom URL-u, možemo ga samo refreshovati ili poslati na uspeh
	redirect(
		`/b/${(await db.business.findUnique({ where: { id: businessId } }))?.slug}`,
	);
}
