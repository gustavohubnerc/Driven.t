import { Router } from 'express';
import { ticketsController } from '@/controllers';
import { authenticateToken, validateBody } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter
    //.all('/*', authenticateToken)
    .get('/types', ticketsController.getTicketTypes)
    .get('/', ticketsController.getTicketFromUser)

export { ticketsRouter };