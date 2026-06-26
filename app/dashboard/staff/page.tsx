import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function StaffPage() {
	const user = await currentUser();
	if (!user) redirect('/login');

	// 1. Vučemo biznis i njegove zaposlene
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

		const email = formData.get('email') as string;

		if (!email) return;

		// 🚀 PRETRAGA KORISNIKA PREKO EMAIL-A
		const userToHire = await db.user.findFirst({
			where: { email: email.toLowerCase().trim() },
		});

		// Ako korisnik ne postoji u tvojoj User tabeli, prekidamo akciju
		if (!userToHire) {
			console.log('Korisnik sa ovim emailom ne postoji u bazi.');
			return;
		}

		const authUser = await currentUser();
		if (!authUser) return;

		const currentBusiness = await db.business.findFirst({
			where: { ownerId: authUser.id },
		});

		if (!currentBusiness) return;

		// Provera da li je korisnik već zaposlen u ovom biznisu
		const alreadyEmployee = await db.employee.findFirst({
			where: {
				businessId: currentBusiness.id,
				userId: userToHire.id,
			},
		});

		if (alreadyEmployee) return;

		// 2. Upisujemo radnika u tabelu Employee koristeći pronađeni ID
		await db.employee.create({
			data: {
				userId: userToHire.id, // <--- Baza dobija svoj obavezni ID ovde
				businessId: currentBusiness.id,
			},
		});

		// 🚀 Čistimo keš za staff rutu kako bi se radnik odmah pojavio u desnoj koloni bez F5
		revalidatePath('/dashboard/staff');
	}

	return (
		<div className='w-full min-h-full lg:py-8 bg-[#09090b] font-sans text-white'>
			<div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 '>
				{/* FORMA ZA REGISTRACIJU RADNIKA PREKO EMAIL-A */}
				<div className='border border-zinc-900 bg-[#0c0c0e] p-6 h-fit'>
					<div className='space-y-1 mb-6 border-b border-zinc-900 pb-4'>
						<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
							{'[ node: employee_registry ]'}
						</span>
						<h2 className='text-xl font-bold uppercase tracking-tight'>
							Add New Employee
						</h2>
					</div>

					<form
						action={addStaff}
						className='space-y-4'>
						<div className='space-y-2'>
							<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
								Employee Email Address
							</label>
							<Input
								type='email'
								name='email'
								required
								placeholder='agent@domain.com'
								className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500'
							/>
							<span className='text-[10px] text-zinc-600 font-mono block mt-1'>
								* Korisnik mora imati otvoren nalog u sistemu da bi bio dodat.
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
							Personnel Registry
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
									<div className='w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shrink-0'>
										[E]
									</div>
									<div className='min-w-0 flex-1'>
										<h3 className='font-medium text-white text-base truncate'>
											{employee.user?.name || 'User'}
										</h3>
										<p className='text-[10px] text-zinc-500 font-mono truncate'>
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
