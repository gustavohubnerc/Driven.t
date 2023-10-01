import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import { createHotel } from "../factories/hotels-factory";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import { createEnrollmentWithAddress, createPayment, createRemoteTicket, createTicket, createTicketType, createTicketWithoutHotel, createUser, createPresencialWithHotelTicket } from "../factories";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe ("GET /hotels", () => {
    it("should respond with status 200 and with existing hotels data", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createPresencialWithHotelTicket();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        await createPayment(ticket.id, ticketType.price);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id:hotel.id,
                name:hotel.name,
                image:hotel.image,
                createdAt:hotel.createdAt.toISOString(),
                updatedAt:hotel.updatedAt.toISOString(),
            })
          ]),
          );
    });

    it("should respond with status 404 when there are no hotels available", async () => {
        const token = await generateValidToken();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when there is no enrollment associated", async () => {
        const token = await generateValidToken();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when there is no ticket associated", async () => {
        const token = await generateValidToken();
        const user = await createUser();

        await createEnrollmentWithAddress(user);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when ticket is not paid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });    

    it("should respond with status 402 when ticket is remote", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createRemoteTicket();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        
        await createPayment(ticket.id, ticketType.price);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 if ticket does not include hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        await createPayment(ticket.id, ticketType.price);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe("when token is invalid", () => {
        it("should respond with status 401 if no token is provided", async () => {
            const response = await server.get('/hotels');

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    });
});

describe ("GET /hotels/:id", () => {
    it("should respond with status 401 if no token is provided", async()=>{
        const {status}= await server.get("/hotels/1");

        expect(status).toBe(httpStatus.UNAUTHORIZED);       
    });

    it("should respond with status 401 if given token is not valid", async()=>{
        const token = faker.lorem.word();

        const {status}= await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(status).toBe(httpStatus.UNAUTHORIZED);       
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when there are no hotels available", async () => {
            const token = await generateValidToken();

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when there is no enrollment associated", async () => {
            const token = await generateValidToken();

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 404 when there is no ticket associated", async () => {
            const token = await generateValidToken();
            const user = await createUser();

            await createEnrollmentWithAddress(user);

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 402 when ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when ticket is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createRemoteTicket();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            await createPayment(ticket.id, ticketType.price);

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 if ticket does not include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

            await createPayment(ticket.id, ticketType.price);

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 200 and hotel data", async ()=>{
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createPresencialWithHotelTicket();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            await createPayment(ticket.id, ticketType.price);
            const {status, body} = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
            expect(status).toEqual(httpStatus.OK);
            expect(body).toMatchObject({
                ...hotel,
                createdAt: hotel.createdAt.toISOString(),
                updatedAt: hotel.updatedAt.toISOString(),
                Rooms: hotel.Rooms.map(room => ({
                  ...room,
                  createdAt: hotel.createdAt.toISOString(),
                  updatedAt: hotel.updatedAt.toISOString(),
                }))
              });
        })
    });
});