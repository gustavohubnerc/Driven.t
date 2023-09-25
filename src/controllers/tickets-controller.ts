import { AuthenticatedRequest } from "@/middlewares/authentication-middleware";
import { ticketsService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
    const ticketTypes = await ticketsService.getTicketTypes();
    res.status(httpStatus.OK).send(ticketTypes);
}

async function getTicketFromUser(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const ticket = await ticketsService.getTicketFromUser(userId);
    res.status(httpStatus.OK).send(ticket);
}

async function createTicket(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { ticketTypeId} = req.body;
    const ticket = await ticketsService.createTicket(userId, ticketTypeId);
    res.status(httpStatus.CREATED).send(ticket);
}

export const ticketsController = {
    getTicketTypes,
    getTicketFromUser,
    createTicket
}