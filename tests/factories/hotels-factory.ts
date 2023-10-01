import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
    const roomsData = [
        {
            name: faker.commerce.color(),
            capacity: faker.datatype.number(),
        },
        {
            name: faker.commerce.color(),
            capacity: faker.datatype.number(),
        },
        {
            name: faker.commerce.color(),
            capacity: faker.datatype.number(),
        }
    ];

    return prisma.hotel.create({
        data: {
            name: faker.company.companyName(),
            image: faker.image.imageUrl(),
            Rooms: {
                createMany: {
                    data: roomsData,
                } 
            }
        }, include: {
            Rooms: true
        }
    });
}

export async function createRooms(hotelId: number, capacity: number) {
    return prisma.room.create({
      data: {
        hotelId,
        name: faker.commerce.color(),
        capacity,
      },
    });
}