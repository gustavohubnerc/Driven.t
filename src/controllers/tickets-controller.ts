import { AuthenticatedRequest } from "@/middlewares/authentication-middleware";
import { ticketsService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

async function getTicketTypes(req: AuthenticatedRequest, res: Response) {
    const ticketTypes = await ticketsService.getTicketTypes();
    return res.status(httpStatus.OK).send(ticketTypes);
}

export const ticketsController = {
    getTicketTypes
}