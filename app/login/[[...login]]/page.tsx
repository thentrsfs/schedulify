import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
	return (
		<div className='relative w-full min-h-screen bg-[#09090b] flex items-center justify-center font-sans text-white p-4'>
			{/* ⚡ CYBERPUNK BACK TO HOME BUTTON */}
			<div className='absolute top-6 left-6 lg:top-8 lg:left-30'>
				<Link
					href='/'
					className='flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors duration-200 border border-zinc-900 bg-[#0c0c0e] px-4 py-2 hover:border-emerald-500/30'>
					<span className='text-emerald-400 font-bold'>&lt;--</span> Return to
					Base
				</Link>
			</div>

			{/* CLERK COMPONENT */}
			<div className='border border-zinc-900 bg-[#0c0c0e] p-2 md:p-4 shadow-2xl'>
				<SignIn
					appearance={{
						elements: {
							card: 'bg-transparent shadow-none border-none',
							headerTitle:
								'text-white font-bold tracking-tight font-sans text-xl',
							headerSubtitle: 'text-zinc-500 font-mono text-xs tracking-wider',
							socialButtonsBlockButton:
								'bg-[#09090b] border-zinc-800 text-white hover:bg-zinc-900 rounded-none font-mono text-xs',
							formButtonPrimary:
								'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono text-xs tracking-wider rounded-none font-bold h-11',
							formFieldLabel:
								'font-mono text-[10px] tracking-widest text-zinc-400 block',
							formFieldInput:
								'bg-[#09090b] border-zinc-800 text-white rounded-none font-mono text-xs h-11 focus:border-emerald-500 focus:ring-0',
							footerActionLink:
								'text-emerald-400 hover:text-emerald-500 font-mono text-xs',
							footerActionText: 'text-zinc-500 font-mono text-xs',
						},
					}}
				/>
			</div>
		</div>
	);
}
