import { FastifyInstance } from "fastify"
import { z } from "zod";
import { prisma } from "../lib/prisma"
import { Authenticate } from "../plugins/authenticate";

export async function authRoutes(fastify: FastifyInstance){
    fastify.get('/me',
    { onRequest: [Authenticate] }, //chama o plugin de autenticação
    async (request) => {
        return { user: request.user } //somente executa se o usuário estiver autenticado
    })

    fastify.post('/users', async (request) =>{
        const createUserBody = z.object({
            access_token: z.string(),
        })

        const { access_token } = createUserBody.parse(request.body);

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method:'GET',
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        // ya29.a0AeTM1ieDbrY6KxYQBVRHuLr9_ZgDZ8yh_vqNaoO0RGrx6V03s5y20sAftIT-3wzxSidrVn5NpVm5Yc98pqCpw-Ll-Q7G7iAAC95kPvAl8Kda6-khhhdAvstsMXdrX7gdD0OtvJgGo66tQDlkgMHZPx5HPhpPngaCgYKAR8SARESFQHWtWOmdP9doD0DkePUsWSHAKTkZw0165

        // valida se os dados estão sendo trazidos corretamente
        const userData = await userResponse.json()
        const userInfoSchema = z.object({
            id: z.string(),
            email: z.string().email(),
            name: z.string(),
            picture: z.string().url(),
        })

        const userInfo = userInfoSchema.parse(userData)

        // busca um usuário existente através do googleID
        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id,                
            }
        })

        // se não existir, cria um novo usuário
        if(!user){
            user = await prisma.user.create({
                data:{
                    googleId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture,
                }
            })
        }

        // assinar um token jwt com o nome e foto do usuário
        const token = fastify.jwt.sign({
            name: user.name,
            avatar: user.avatarUrl,
        },{ // dados do token e expiração
            sub: user.id,
            expiresIn: '7 days',
        })

        return {token}
    })
}