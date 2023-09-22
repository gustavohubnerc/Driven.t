import { ticketRepository } from "@/repositories/tickets-repository"

async function getTicketTypes() {
    const ticketTypes = await ticketRepository.getTicketTypes();
    return ticketTypes;
}

export const ticketsService = {
    getTicketTypes
}