import { notFoundError } from "@/errors";
import { ticketRepository } from "@/repositories/tickets-repository"

async function getTicketTypes() {
    const ticketTypes = await ticketRepository.getTicketTypes();
    return ticketTypes;
}

async function getTicketFromUser(userId: number) {
    const checkUser = await ticketRepository.getEnrollmentFromUser(userId);
    if (!checkUser) {
        throw notFoundError();
    }
    
    const ticket = await ticketRepository.getTicketFromUser(checkUser.id);
    if (!ticket) {
        throw notFoundError();
    }

    return ticket;
}

export const ticketsService = {
    getTicketTypes,
    getTicketFromUser
}