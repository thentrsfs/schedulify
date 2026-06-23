import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/ui/themes';

// Inter za regularan tekst
const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

// Space Grotesk za naslove i veće stvari
const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-space',
});

export const metadata: Metadata = {
	title: 'Schedulify | Autonomous Business Scheduling',
	description:
		'Next-generation multi-tenant scheduling platform for modern enterprises.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider appearance={{ theme: dark }}>
			<html
				lang='en'
				className={cn(
					'h-full',
					'antialiased',
					'dark',
					inter.variable,
					spaceGrotesk.variable,
				)}>
				<body className='h-full flex flex-col bg-[#09090b] text-zinc-50 font-sans antialiased'>
					<div className='flex-1 min-h-0 w-full overflow-y-auto'>
						{children}
					</div>
				</body>
			</html>
		</ClerkProvider>
	);
}
