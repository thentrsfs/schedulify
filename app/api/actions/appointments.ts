"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteAppointment(appointmentId: string) {
    try {
        // Brišemo termin iz baze na osnovu njegovog ID-ja
        await db.appointment.delete({
            where: {
                id: appointmentId,
            },
        });

        // Osvežavamo keš za appointment stranicu da povuče nove podatke
        revalidatePath("/dashboard/appointments");
        return { success: true };
    } catch (error) {
        console.error("FAILED_TO_DELETE_RECORD:", error);
        return { success: false, error: "System mutation failed." };
    }
}