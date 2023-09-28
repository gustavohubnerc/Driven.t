import { prisma } from "@/config";

async function listHotels() {
  const hotels = await prisma.hotel.findMany();
  const hotelList = hotels.map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    image: hotel.image,
    createdAt: hotel.createdAt.toISOString(),
    updatedAt: hotel.updatedAt.toISOString(),
  }));
  return hotelList;
}

async function getUserEnrollment(userId: number) {
    const userEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          Ticket: {
            status: 'PAID',
            TicketType: {
              includesHotel: true,
            },
          },
        },
        include: {
          Ticket: {
            include: {
              TicketType: true,
            },
          },
        },
    });

    return userEnrollment;
} 

async function getHotelRooms(hotelId: number) {
  const hotel = await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });

  const hotelWithRooms = {
    id: hotel.id,
    name: hotel.name,
    image: hotel.image,
    createdAt: hotel.createdAt.toISOString(),
    updatedAt: hotel.updatedAt.toISOString(),
    Rooms: hotel.Rooms.map((room) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      hotelId: room.hotelId,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    })),
  };

  return hotelWithRooms;
}

export const hotelsRepository = {
    listHotels,
    getUserEnrollment,
    getHotelRooms
};