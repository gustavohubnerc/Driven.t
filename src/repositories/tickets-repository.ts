import { prisma } from '@/config';
import { Ticket, TicketType } from '@prisma/client';

async function getTicketTypes() {
    return await prisma.ticketType.findMany();
}

async function getEnrollmentFromUser(enrollmentId: number) {
    return await prisma.ticket.findFirst({
        where: {
            enrollmentId
        },
        include: {
            TicketType: true
        }
    })
}

async function getTicketFromUser(ticketId: number) {
    return prisma.ticket.findUnique({
        where: {
            id: ticketId
        },
        include: {
            TicketType: true
        }
    })
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
    return await prisma.ticket.create({
        data: {
            enrollmentId,
            ticketTypeId,
            status: 'RESERVED'
        },
        include: {
            TicketType: true
        }
    })
}

export const ticketRepository = {
    getTicketTypes,
    getEnrollmentFromUser,
    getTicketFromUser,
    createTicket
}