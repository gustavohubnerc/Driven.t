import { notFoundError, requestError } from "@/errors";
import { hotelsRepository } from "@/repositories/hotels-repository";

async function listHotels(userId: number){
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);
    
    if (!userEnrollment) {
        throw notFoundError();
    }

    if (!userEnrollment.Ticket) {
        throw requestError(402, 'Ticket not found');
    }

    const paidTicket = userEnrollment.Ticket.status;
    const includesHotel = userEnrollment.Ticket.TicketType.includesHotel;
    const isRemote = userEnrollment.Ticket.TicketType.isRemote;

    if (paidTicket !== 'PAID') {
        throw requestError(402, 'Ticket is not paid');
    }

    if (isRemote) {
        throw requestError(402, 'Ticket is remote');
    }

    if (!includesHotel) {
        throw requestError(402, 'Ticket does not include hotel');
    }

    const hotels = await hotelsRepository.listHotels();

    if (!hotels || hotels.length === 0) {
        throw notFoundError();
    }

    return hotels;
}


async function getHotelRooms(userId: number, hotelId: number) {
    const userEnrollment = await hotelsRepository.getUserEnrollment(userId);
    
    if (!userEnrollment) {
        throw notFoundError();
    }

    if (!userEnrollment.Ticket) {
        throw requestError(402, 'Ticket not found');
    }

    const paidTicket = userEnrollment.Ticket.status;
    const includesHotel = userEnrollment.Ticket.TicketType.includesHotel;
    const isRemote = userEnrollment.Ticket.TicketType.isRemote;

    if (paidTicket !== 'PAID') {
        throw requestError(402, 'Ticket is not paid');
    }

    if (isRemote) {
        throw requestError(402, 'Ticket is remote');
    }

    if (!includesHotel) {
        throw requestError(402, 'Ticket does not include hotel');
    }

    const hotelRooms = await hotelsRepository.getHotelRooms(hotelId);

    if (!hotelRooms) {
        throw notFoundError();
    }

    return hotelRooms;
}

export const hotelsService = {
    listHotels,
    getHotelRooms
}