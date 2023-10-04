import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import { bookingsService } from "@/services/bookings-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingsService.getBooking(userId);

  return res.status(httpStatus.OK).send(booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  const booking = await bookingsService.createBooking(userId, roomId);

  return res.status(httpStatus.OK).send(booking);
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  const booking = await bookingsService.updateBooking(userId, roomId);

  return res.status(httpStatus.OK).send(booking);
}