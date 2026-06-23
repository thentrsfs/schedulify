import Navbar from '@/components/Navbar'; // ili gde god ti se nalazi komponenta

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex flex-col min-h-screen'>
			<Navbar />
			<main className='flex-1'>{children}</main>
		</div>
	);
}
