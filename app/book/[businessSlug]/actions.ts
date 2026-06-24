'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 🚀 Dodajemo 'inputs' u tip kako bismo vratili ono što je klijent kucao
export type BookingState = {
    error: string | null;
    success: boolean;
    redirectUrl: string | null;
    inputs?: {
        name: string;
        email: string;
        serviceId: string;
        employeeId: string;
        date: string;
        time: string;
        notes: string;
    };
};

export async function handleClientBooking(
    prevState: BookingState | null,
    formData: FormData
): Promise<BookingState> {
    
    const businessId = formData.get('businessId') as string;
    const businessSlug = formData.get('businessSlug') as string;
    const serviceId = formData.get('serviceId') as string;
    const employeeId = formData.get('employeeId') as string;
    const dateStr = formData.get('date') as string; 
    const timeStr = formData.get('time') as string; 
    const clientEmail = formData.get('email') as string;
    const clientName = formData.get('name') as string;
    const notes = formData.get('notes') as string;

    // Pakujemo trenutne inpute da ih imamo spremne za povratak ako nešto fejsuje
    const currentInputs = {
        name: clientName,
        email: clientEmail,
        serviceId,
        employeeId,
        date: dateStr,
        time: timeStr,
        notes
    };

    if (!serviceId || !employeeId || !dateStr || !timeStr || !clientEmail || !businessId) {
        return { error: 'Missing required fields.', success: false, redirectUrl: null, inputs: currentInputs };
    }

    const startTime = new Date(`${dateStr}T${timeStr}:00`);
    const selectedService = await db.service.findUnique({ where: { id: serviceId } });
    
    if (!selectedService) {
        return { error: 'Service not found.', success: false, redirectUrl: null, inputs: currentInputs };
    }

    const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);

    // VALIDACIJA: Provera preklapanja
    const conflictingAppointment = await db.appointment.findFirst({
        where: {
            employeeId: employeeId,
            status: { not: 'CANCELLED' },
            OR: [
                { startTime: { lte: startTime }, endTime: { gt: startTime } },
                { startTime: { lt: endTime }, endTime: { gte: endTime } },
                { startTime: { gte: startTime }, endTime: { lte: endTime } }
            ]
        }
    });

    // 🚀 Ako je operater zauzet, vraćamo grešku ALI I SVE INPUTE nazad klijentu
    if (conflictingAppointment) {
        return { 
            error: 'Selected operator is busy at this time. Please choose another slot.', 
            success: false, 
            redirectUrl: null,
            inputs: currentInputs // Ovo sprečava brisanje forme!
        };
    }

    let customer = await db.user.findFirst({ where: { email: clientEmail } });
    if (!customer) {
        customer = await db.user.create({
            data: { email: clientEmail, name: clientName || 'Anonymous Client' }
        });
    }

    await db.appointment.create({
        data: {
            businessId,
            customerId: customer.id,
            employeeId,
            serviceId,
            startTime,
            endTime,
            notes: notes || null,
            status: 'PENDING',
        }
    });

    revalidatePath('/dashboard/appointments');
    
    return { error: null, success: true, redirectUrl: `/book/${businessSlug}/success` };
}