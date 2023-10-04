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
        select: {
          id: true
        }
    });
}

async function roomInfo(roomId: number) {
    return await prisma.room.findFirst({
        where: { id: roomId },
        select: {
            capacity: true,
            Booking: true
        },
    });
}

async function updateBooking(id: number, roomId: number) {
    return await prisma.booking.update({
        data: {
            roomId
        },
        where: {
            id
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