import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache'; // 🚀 Ključno za brisanje starog keša
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function OnboardingPage() {
	// 1. Provera korisnika pri učitavanju stranice
	const user = await currentUser();
	if (!user) redirect('/login'); // Usklađeno sa tvojom novom /login rutom

	const dbUser = await db.user.findUnique({
		where: { id: user.id },
		include: { ownedBusinesses: true },
	});

	// Ako korisnik već ima biznis, nema potrebe da bude ovde, šalji ga na dashboard
	if (!dbUser || dbUser.ownedBusinesses.length > 0) {
		redirect('/dashboard');
	}

	// 2. Server Action
	async function createBusiness(formData: FormData) {
		'use server';

		const authUser = await currentUser();
		if (!authUser) throw new Error('Unauthorized');

		const name = formData.get('name') as string;
		const address = formData.get('address') as string;

		// Bezbedan slug generator
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		if (!name || !address) return;

		// Upis u Neon bazu preko Prisme
		await db.business.create({
			data: {
				name: name,
				slug: slug,
				address: address,
				ownerId: authUser.id,
			},
		});

		// 🚀 OVO JE MAGIJA: Kažemo ruteru da obriše stari keš za dashboard i pročita bazu ponovo!
		revalidatePath('/dashboard');

		// Tek sada radimo bezbedan redirect
		redirect('/dashboard');
	}

	return (
		<div className='w-full min-h-full bg-[#09090b] flex items-center justify-center p-6 font-sans'>
			<div className='w-full max-w-md border border-zinc-900 bg-[#0c0c0e] p-8 rounded-none shadow-2xl'>
				<div className='space-y-2 mb-8 border-b border-zinc-900 pb-6'>
					<span className='font-mono text-xs uppercase tracking-widest text-emerald-400'>
						{'[ node: initialize_tenant ]'}
					</span>
					<h1 className='font-heading text-2xl font-bold tracking-tight text-white uppercase mt-1'>
						Setup Your Node
					</h1>
				</div>

				<form
					action={createBusiness}
					className='space-y-6'>
					<div className='space-y-2'>
						<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
							Business Name
						</label>
						<Input
							name='name'
							type='text'
							required
							placeholder='e.g. Cyber Cut Barber'
							className='bg-[#09090b] border-zinc-800 text-white rounded-none focus-visible:ring-emerald-500 font-mono text-sm h-11 placeholder:text-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
							Business Address
						</label>
						<Input
							name='address'
							type='text'
							required
							placeholder='e.g. 123 Main St, New York, NY 10001'
							className='bg-[#09090b] border-zinc-800 text-white rounded-none focus-visible:ring-emerald-500 font-mono text-sm h-11 placeholder:text-zinc-700'
						/>
					</div>

					<Button
						type='submit'
						className='w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none h-11 transition-colors font-bold'>
						Deploy Business Instance
					</Button>
				</form>
			</div>
		</div>
	);
}
