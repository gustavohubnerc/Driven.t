import { notFoundError, requestError } from "@/errors";
import { enrollmentRepository, ticketsRepository } from "@/repositories";
import { hotelsRepository } from "@/repositories/hotels-repository";
import { TicketStatus } from "@prisma/client";

async function listHotels(userId: number){
    const hotels = await hotelsRepository.listHotels();
    return hotels;
}


async function getHotelRooms(userId: number, hotelId: number) {
    const hotelRooms = await hotelsRepository.getHotelRooms(hotelId);
    return hotelRooms;
}

async function checkInfo(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
        throw notFoundError();
    }

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) {
        throw notFoundError();
    }

    if (ticket.status !== TicketStatus.PAID || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw requestError(402, 'Ticket is not paid or is remote or does not include hotel');
    }
} 

export const hotelsService = {
    listHotels,
    getHotelRooms,
    checkInfo
}