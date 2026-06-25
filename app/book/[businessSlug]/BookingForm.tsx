'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleClientBooking, type BookingState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Business, Service, Employee, User } from '@prisma/client';

type BusinessWithRelations = Business & {
	services: Service[];
	employees: (Employee & {
		user: User | null; // Pošto u šemi user može biti opcionalan
	})[];
};

interface BookingFormProps {
	business: BusinessWithRelations;
}

const initialState: BookingState = {
	error: null,
	success: false,
	redirectUrl: null,
};

export default function BookingForm({ business }: BookingFormProps) {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(
		handleClientBooking,
		initialState,
	);

	const todayStr = new Date().toISOString().split('T')[0];

	useEffect(() => {
		if (state?.success && state?.redirectUrl) {
			router.push(state.redirectUrl);
		}
	}, [state, router]);

	return (
		<form
			action={formAction}
			className='space-y-4'>
			<input
				type='hidden'
				name='businessId'
				value={business.id}
			/>
			<input
				type='hidden'
				name='businessSlug'
				value={business.slug}
			/>

			{state?.error && (
				<div className='border border-red-500/30 bg-red-500/10 p-3 font-mono text-[11px] text-red-400 text-center uppercase tracking-wider'>
					{`[ alert: ${state.error} ]`}
				</div>
			)}

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				<div className='space-y-2'>
					<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
						Your Name
					</label>
					{/* 🚀 Dodat defaultValue */}
					<Input
						name='name'
						required
						defaultValue={state?.inputs?.name || ''}
						placeholder='John Doe'
						className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
					/>
				</div>
				<div className='space-y-2'>
					<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
						Email Address
					</label>
					{/* 🚀 Dodat defaultValue */}
					<Input
						type='email'
						name='email'
						required
						defaultValue={state?.inputs?.email || ''}
						placeholder='john@example.com'
						className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
					/>
				</div>
			</div>

			{/* SELEKCIJA USLUGE */}
			<div className='space-y-2'>
				<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
					Select Service
				</label>
				{/* 🚀 Dodat value preko state.inputs da zadrži selekciju */}
				<select
					name='serviceId'
					required
					defaultValue={state?.inputs?.serviceId || ''}
					className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e]'>
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

			{/* SELEKCIJA OPERATERA */}
			<div className='space-y-2'>
				<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
					Preferred Operator
				</label>
				{/* 🚀 Dodat value preko state.inputs da zadrži selekciju */}
				<select
					name='employeeId'
					required
					defaultValue={state?.inputs?.employeeId || ''}
					className='w-full bg-[#09090b] border border-zinc-800 text-white rounded-none font-mono text-xs h-11 px-3 focus:outline-none focus:border-emerald-500 [&>option]:bg-[#0c0c0e]'>
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

			<div className='grid grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
						Target Date
					</label>
					{/* 🚀 Dodat defaultValue */}
					<Input
						type='date'
						name='date'
						required
						min={todayStr}
						defaultValue={state?.inputs?.date || ''}
						className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
					/>
				</div>
				<div className='space-y-2'>
					<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
						Target Time
					</label>
					{/* 🚀 Dodat defaultValue */}
					<Input
						type='time'
						name='time'
						required
						defaultValue={state?.inputs?.time || ''}
						className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<label className='font-mono text-[10px] uppercase tracking-widest text-zinc-400 block'>
					Additional Specs (Optional)
				</label>
				{/* 🚀 Dodat defaultValue */}
				<Input
					name='notes'
					defaultValue={state?.inputs?.notes || ''}
					placeholder='Any specific instructions...'
					className='bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11'
				/>
			</div>

			<Button
				type='submit'
				disabled={isPending}
				className='w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-mono text-xs uppercase tracking-wider rounded-none font-bold h-11 mt-4'>
				{isPending ? 'Transmitting Request...' : 'Transmit Booking Request'}
			</Button>
		</form>
	);
}
