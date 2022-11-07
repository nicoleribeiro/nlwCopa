import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"

export async function poolRoutes(fastify: FastifyInstance){
    fastify.get('/pools/count', async () =>{
        const count = await prisma.pool.count()

        return {count}
    })

    fastify.post('/pools', async (request, reply) =>{
        // Valida o title
        const createPollBody = z.object({
            title: z.string(),
        })
        
        const { title } = createPollBody.parse(request.body)

        const generate = new ShortUniqueId({length: 6}) // Cria um código único de 6 caracteres
        const code = String(generate()).toUpperCase()

        await prisma.pool.create({
            data: {
                title,
                code
            }
        });

        return reply.status(201).send({code})
    })
}