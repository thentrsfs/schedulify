'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function MobileMenu({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);

	// Funkcija koja proverava da li je korisnik kliknuo na link i zatvara meni
	const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;

		// Ako je kliknut link (A tag) ili bilo šta unutar linka, zatvori meni
		if (target.closest('a')) {
			setOpen(false);
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button className='p-2 border rounded-md lg:hidden'>
					<Menu className='h-5 w-5' />
				</button>
			</SheetTrigger>
			<SheetContent
				side='left'
				className='w-72 p-0 bg-[#0c0c0e]'
				onClick={handleContentClick}>
				<div className='h-full w-full'>{children}</div>
			</SheetContent>
		</Sheet>
	);
}
