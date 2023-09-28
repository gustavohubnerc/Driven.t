import { AuthenticatedRequest } from "@/middlewares";
import { hotelsService } from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function listHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotels = await hotelsService.listHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { hotelId } = req.params;
    const hotelRooms = await hotelsService.getHotelRooms(userId, Number(hotelId));
    return res.status(httpStatus.OK).send(hotelRooms);
}