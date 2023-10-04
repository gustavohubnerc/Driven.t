import { forbiddenError, notFoundError } from "@/errors";
import { enrollmentRepository, ticketsRepository } from "@/repositories";
import { bookingsRepository } from "@/repositories/bookings-repository";
import { exclude } from '@/utils/prisma-utils';

async function getBooking(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }

    const booking = await bookingsRepository.getBooking(userId);
    if (!booking) {
        throw notFoundError();
    }

    return exclude(booking, 'createdAt', 'updatedAt');
}

async function createBooking(userId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }

    if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel|| ticket.status !== 'PAID') {
        throw forbiddenError();
    }

    const roomInfo = await bookingsRepository.roomInfo(roomId);
    if (!roomInfo) {
        throw notFoundError();
    }

    if (roomInfo.capacity <= roomInfo.Booking.length) {
        throw forbiddenError();
    }

    const booking = await bookingsRepository.createBooking(userId, roomId);

    return {
        bookingId: booking.id,
    };
}

export const bookingsService = {
    getBooking,
    createBooking,
};