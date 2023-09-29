import { notFoundError, requestError } from "@/errors";
import { hotelsRepository } from "@/repositories/hotels-repository";

async function listHotels(userId: number){
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);
    if (!userEnrollment) throw notFoundError();

    const paidTicket = userEnrollment.Ticket.status;
    if (paidTicket !== 'PAID') throw requestError(402, 'Ticket is not paid');

    const includesHotel = userEnrollment.Ticket.TicketType.includesHotel;
    if (includesHotel === false) throw requestError(402, 'Ticket does not include hotel');

    const isRemote = userEnrollment.Ticket.TicketType.isRemote;
    if (isRemote === true) throw requestError(402, 'Ticket is remote');

    const hotels = await hotelsRepository.listHotels();
    if (!hotels) throw notFoundError();

    return hotels;
}

async function getHotelRooms(userId: number, hotelId: number) {
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);
    if (!userEnrollment) throw notFoundError();

    const paidTicket = userEnrollment.Ticket.status === 'PAID';
    if (!paidTicket) throw requestError(402, 'Ticket is not paid');

    const includesHotel = userEnrollment.Ticket.TicketType.includesHotel;
    if (!includesHotel) throw requestError(402, 'Ticket does not include hotel');

    const isRemote = userEnrollment.Ticket.TicketType.isRemote;
    if (isRemote) throw requestError(402, 'Ticket is remote');

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