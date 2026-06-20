import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
	return (
		<div className='w-full min-h-[calc(100vh-4rem)] bg-[#09090b] flex items-center justify-center px-4/5 py-12'>
			<SignUp />
		</div>
	);
}
