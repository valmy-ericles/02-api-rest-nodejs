import { FastifyInstance } from "fastify"
import { z } from 'zod'
import crypto from 'crypto'

import { knex } from "../database"
import { checkSessionExists } from "../middlewares/checkSessionIdExists"

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [checkSessionExists]
  } ,async (req, reply) => {
    const { sessionId } = req.cookies

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()
    
      return {
      transactions
    };
  })

  app.get('/:id', {
    preHandler: [checkSessionExists]
  } ,async (req) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(req.params)
    const { sessionId } = req.cookies

    const transaction = await knex('transactions')
      .where({ session_id: sessionId, id })
      .first()

    return { transaction }
  })

  app.get('/summary', {
    preHandler: [checkSessionExists]
  }, async (req) => {
    const { sessionId } = req.cookies

    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()
    return { summary }
  })

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)
    
    let sessionId = req.cookies.sessionId
    if(!sessionId) {
      sessionId = crypto.randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    const transaction = await knex('transactions')
      .insert({ 
        id: crypto.randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      })

    return reply.status(201).send()
  })
}
