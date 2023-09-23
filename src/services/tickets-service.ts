import { notFoundError, requestError } from "@/errors";
import { ticketRepository } from "@/repositories/tickets-repository"

async function getTicketTypes() {
    const ticketTypes = await ticketRepository.getTicketTypes();
    return ticketTypes;
}

async function getTicketFromUser(userId: number) {
    const checkEnrollment = await ticketRepository.getEnrollmentFromUser(userId);
    if (!checkEnrollment) {
        throw notFoundError();
    }
    
    const ticket = await ticketRepository.getTicketFromUser(checkEnrollment.id);
    if (!ticket) {
        throw notFoundError();
    }

    return ticket;
}

async function createTicket(userId: number, ticketTypeId: number) {
    if (!ticketTypeId) {
        throw requestError(400, 'ticketTypeId is required');
    }

    const checkEnrollment = await ticketRepository.getEnrollmentFromUser(userId);
    if (!checkEnrollment) {
        throw notFoundError();
    }

    const ticket = await ticketRepository.createTicket(checkEnrollment.id, ticketTypeId);
    return ticket;
}


export const ticketsService = {
    getTicketTypes,
    getTicketFromUser,
    createTicket
}