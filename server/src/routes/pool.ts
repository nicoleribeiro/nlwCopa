import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { Authenticate } from "../plugins/authenticate"

export async function poolRoutes(fastify: FastifyInstance){
    // conta os bolões
    fastify.get('/pools/count', async () =>{
        const count = await prisma.pool.count()

        return {count}
    })

    // cria um bolão
    fastify.post('/pools', async (request, reply) =>{
        // Valida o title
        const createPollBody = z.object({
            title: z.string(),
        })
        
        const { title } = createPollBody.parse(request.body)

        const generate = new ShortUniqueId({length: 6}) // Cria um código único de 6 caracteres
        const code = String(generate()).toUpperCase()

        try{
            // verifica se o usuário existe
            await request.jwtVerify();

            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,

                    // cria um participante automaticamente com o mesmo userId do google
                    participants: {
                        create: {
                            userId: request.user.sub,
                        }
                    }
                }
            });
        } catch {
            // se não tiver um usuário autenticado, cria um bolão pro novo usuário
            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            });
        }

        return reply.status(201).send({code})
    })

    // busca um bolão pelo código
    fastify.post('/pools/join',
    { onRequest: [Authenticate] },
    async (request, reply) => {
        const joinPoolBody = z.object({
            code: z.string(),
        })

        const { code } = joinPoolBody.parse(request.body)

        // busca um boão pelo id
        const pool = await prisma.pool.findUnique({
            where: {
                code,
            },
            // include é um join com outras tabelas, busca um participante com o mesmo id do bolão buscado
            include: {
                participants: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })

        // se não houver bolão
        if(!pool){
            return reply.status(400).send({
                message: 'Pool not found.',
            })
        }
        // se houver participante do bolão encontrado
        else if (pool.participants.length > 0){
            return reply.status(400).send({
                message: 'You are already in this pool.',
            })
        }
        // se não houver dono do bolão, coloca o usuário como dono (apenas porque não tem login na web no projeto)
        else if(!pool.ownerId){
            await prisma.pool.update({
                where: {
                    id: pool.id,
                },
                data: {
                    ownerId: request.user.sub
                }
            })
        }

        // se tudo deu certo, cria um participante no bolão
        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: request.user.sub,
            }
        })

        return reply.status(201).send()
    })

    // busca bolões que o usuário participa
    fastify.get('/pools', 
    { onRequest: [Authenticate] },
    async (request) => {
        // buscar mais de um bolão
        const pools = await prisma.pool.findMany({
            where: {
                participants: {
                    some: { // onde pelo menos um participante tenha o mesmo id do usuário
                        userId: request.user.sub, 
                    }
                }
            },
            include: {
                _count:{ // conta quantos participantes tem
                    select: {
                        participants: true,
                    }
                },
                participants: { // pega o id e o avatar dos 4 primeiros participantes
                    select: {
                        id: true,

                        user: { // o avatar está na tabela user que já faz relacionamento com a participant então não precisa colocar o include de novo
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4
                },
                owner: { // join com a tabela de donos
                    select: { // dando select apenas no nome e id 
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return { pools }
    })

    // detalhar um bolão
    fastify.get('/pools/:id',
    { onRequest: [Authenticate] },
    async (request) => {
        const getPoolParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolParams.parse(request.params)

        const pool = await prisma.pool.findUnique({
            where: {
                id,
            },
            include: {
                _count:{
                    select: {
                        participants: true,
                    }
                },
                participants: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4
                },
                owner: {
                    select: { 
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return { pool }
    })
}