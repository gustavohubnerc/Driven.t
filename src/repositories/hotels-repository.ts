import { prisma } from "@/config";
import { notFoundError } from "@/errors";

async function listHotels() {
  const hotels = await prisma.hotel.findMany();
  if (hotels.length === 0) {
    throw notFoundError();
  }
  return hotels;
}

async function getHotelRooms(hotelId: number) {
  const result = await prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });

  if (!result) {
    throw notFoundError();
  };

  return result;
}

export const hotelsRepository = {
    listHotels,
    getHotelRooms
};