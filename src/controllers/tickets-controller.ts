import { AuthenticatedRequest } from "@/middlewares/authentication-middleware";
import { ticketsService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
    const ticketTypes = await ticketsService.getTicketTypes();
    return res.status(httpStatus.OK).send(ticketTypes);
}

async function getTicketFromUser(req: AuthenticatedRequest, res: Response) {
    const ticket = await ticketsService.getTicketFromUser(req.userId);
    return res.status(httpStatus.OK).send(ticket);
}

async function createTicket(req: AuthenticatedRequest, res: Response) {
    const ticket = await ticketsService.createTicket(req.userId, req.body.ticketTypeId);
    return res.status(httpStatus.CREATED).send(ticket);
}

export const ticketsController = {
    getTicketTypes,
    getTicketFromUser,
    createTicket
}