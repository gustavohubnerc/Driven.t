import { forbiddenError, notFoundError } from "@/errors";
import { enrollmentRepository, ticketsRepository } from "@/repositories";
import { bookingsRepository } from "@/repositories/booking-repository";
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

    return {
        id: booking.id,
        Room: booking.Room
    };
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

async function updateBooking(userId: number, roomId: number, bookingId: number) {
    const booking = await bookingsRepository.getBooking(userId);
    if (!booking || booking.id !== bookingId) {
        throw forbiddenError();
    }

    const roomInfo = await bookingsRepository.roomInfo(roomId);
    if (!roomInfo || roomInfo.id !== roomId) {
        throw notFoundError();
    }

    if (roomInfo.capacity <= roomInfo.Booking.length) {
        throw forbiddenError();
    }

    const updatedBooking = await bookingsRepository.updateBooking(bookingId, roomId);

    return {
        bookingId: updatedBooking.id
    };
}

export const bookingsService = {
    getBooking,
    createBooking,
    updateBooking
};