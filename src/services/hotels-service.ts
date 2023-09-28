import { notFoundError } from "@/errors";
import { hotelsRepository } from "@/repositories/hotels-repository";

async function listHotels(userId: number){
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);

    if (!userEnrollment) throw notFoundError();

    const hotels = await hotelsRepository.listHotels();

    return hotels;
}

async function getHotelRooms(userId: number, hotelId: number) {
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);

    if (!userEnrollment) throw notFoundError();

    const hotelRooms = await hotelsRepository.getHotelRooms(hotelId);

    if (!hotelRooms) throw notFoundError();

    return hotelRooms;
}

export const hotelsService = {
    listHotels,
    getHotelRooms
}