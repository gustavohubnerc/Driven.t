import { notFoundError, requestError } from "@/errors";
import { ticketRepository } from "@/repositories/tickets-repository"
import { enrollmentRepository } from '@/repositories/enrollments-repository';

async function getTicketTypes() {
    const ticketTypes = await ticketRepository.getTicketTypes();
    return ticketTypes;
}

async function getTicketFromUser(userId: number) {
    const checkEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!checkEnrollment) {
        throw notFoundError();
    }
    
    const ticket = await ticketRepository.getEnrollmentFromUser(checkEnrollment.id);
    if (!ticket) {
        throw notFoundError();
    }

    return ticket;
}

async function createTicket(userId: number, ticketTypeId: number) {
    if (!ticketTypeId) {
        throw requestError(400, 'ticketTypeId is required');
    }

    const checkEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!checkEnrollment) {
        throw notFoundError();
    }

    return await ticketRepository.createTicket(checkEnrollment.id, ticketTypeId);
}


export const ticketsService = {
    getTicketTypes,
    getTicketFromUser,
    createTicket
}