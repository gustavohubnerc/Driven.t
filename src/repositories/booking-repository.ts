import { prisma } from '@/config';

async function getBooking(userId: number) {
    return await prisma.booking.findFirst({
        where: { userId },
        include: {
            Room: true,
        },
    });
}

async function createBooking(userId: number, roomId: number) {
    return await prisma.booking.create({
        data: {
          userId,
          roomId
        },
        include: {
          Room: true
        }
    });
}

async function roomInfo(roomId: number) {
    return await prisma.room.findFirst({
        where: {
             id: roomId
        },
        include: {
            Booking: true
        }
    });
}

async function updateBooking(bookingId: number, roomId: number) {
    return await prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId
        },
        select: {
            id: true
        }
    });
}

export const bookingsRepository = {
    getBooking,
    createBooking,
    roomInfo,
    updateBooking
};