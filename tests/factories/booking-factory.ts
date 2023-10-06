import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createBooking(userId: number, roomId: number) {
    return await prisma.booking.create({
        data: {
            userId,
            roomId,
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent()
        },
    });
}

export async function createRoomWithNoVacancy(hotelId: number) {
    return await prisma.room.create({
        data: {
            name: 'Room 200',
            capacity: 0,
            hotelId: hotelId
        }
    });
}