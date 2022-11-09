import { FastifyInstance } from "fastify"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { Authenticate } from "../plugins/authenticate"

export async function gameRoutes(fastify: FastifyInstance){
    fastify.get('/pools/:id/games',
    { onRequest: [Authenticate] },
    async (request) => {
        const getGamesParams = z.object({
            id: z.string(),
        })

        const { id } = getGamesParams.parse(request.params)

        const games = await prisma.game.findMany({
            // ordenar por data de forma descrescente
            orderBy:{
                date: 'desc',
            },
            include:{
                guesses:{
                    where:{
                        participant:{
                            userId: request.user.sub,
                            poolId: id
                        }
                    }
                }
            }
        })

        return {
            // percorre o array de games
            games: games.map(game => {
                return {
                    ...game, // mostra todos os dados de game
                    guess: game.guesses.length > 0 ? game.guesses[0] : null, // mostra somente o primeiro guess
                    guesses: undefined // esconde o array de guesses
                }
            })
        }
    })
}