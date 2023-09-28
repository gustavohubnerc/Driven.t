import { notFoundError, requestError } from "@/errors";
import { hotelsRepository } from "@/repositories/hotels-repository";

async function listHotels(userId: number){
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);
    if (!userEnrollment.Ticket.TicketType.includesHotel) throw requestError(402, 'Ticket does not include hotel');
    if (userEnrollment.Ticket.status !== 'PAID') throw requestError(402, 'Ticket is not paid');
    if (userEnrollment.Ticket.TicketType.isRemote) throw requestError(402, 'Ticket is remote');
    if (!userEnrollment) throw notFoundError();

    const hotels = await hotelsRepository.listHotels();
    if (!hotels) throw notFoundError();

    return hotels;
}

async function getHotelRooms(userId: number, hotelId: number) {
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);
    if (!userEnrollment.Ticket.TicketType.includesHotel) throw requestError(402, 'Ticket does not include hotel');
    if (userEnrollment.Ticket.status !== 'PAID') throw requestError(402, 'Ticket is not paid');
    if (userEnrollment.Ticket.TicketType.isRemote) throw requestError(402, 'Ticket is remote');
    if (!userEnrollment) throw notFoundError();

    const hotels = await hotelsRepository.listHotels();
    if (!hotels) throw notFoundError();

    const hotelRooms = await hotelsRepository.getHotelRooms(hotelId);
    if (!hotelRooms) throw notFoundError();

    return hotelRooms;
}

export const hotelsService = {
    listHotels,
    getHotelRooms
}