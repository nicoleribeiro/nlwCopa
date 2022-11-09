import '@fastify/jwt'

declare module '@fastify/jwt'{
    interface FastifyJWT {
        sub: string,
        name: string,
        avatarUrl: string,
    }
}