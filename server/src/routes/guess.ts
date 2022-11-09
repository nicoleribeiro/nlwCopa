import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { Authenticate } from "../plugins/authenticate"

export async function guessRoutes(fastify: FastifyInstance){
    fastify.get('/guesses/count', async () =>{
        const count = await prisma.guess.count()

        return {count}
    })

    fastify.post('/pools/:poolId/games/:gameId/guesses',
    { onRequest: [Authenticate] },
    async (request, reply) => {
        const createGuessParams = z.object({
            poolId: z.string(),
            gameId: z.string(),
        })

        const createGuessBody = z.object({
            firstTeamPoints: z.number(),
            secondTeamPoints: z.number(),
        })

        const { poolId, gameId } = createGuessParams.parse(request.params)
        const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(request.body)

        // busca um participante para o bolão e usuário do palpite
        const participant = await prisma.participant.findUnique({
            where: {
                userId_poolId: {
                    poolId,
                    userId: request.user.sub
                }
            }
        })

        if(!participant){
            return reply.status(400).send({
                message: 'You are not a participant of this pool'
            })
        }

        // busca um palpite existente para o jogo e participante
        const guess = await prisma.guess.findUnique({
            where: {
                gameId_participantId: {
                    gameId,
                    participantId: request.user.sub,
                }
            }
        })

        if(guess){
            return reply.status(400).send({
                message: 'You already made a guess for this game'
            })
        }

        // busca se existe um game com o id passado
        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            }
        })

        if(!game){
            return reply.status(400).send({
                message: 'Game not found'
            })
        }

        if(game.date < new Date()){
            reply.status(400).send({
                message: 'You can not make a guess for a game that has already started'
            })
        }

        await prisma.guess.create({
            data: {
                gameId,
                participantId: participant.id,
                firstTeamPoints,
                secondTeamPoints,
            }
        })

        return reply.status(201).send()
    })
}