import { db } from '../src/db'
import { Prisma } from '@prisma/client';

const userData: Prisma.UserCreateInput[] = [{
    email: 'test@test.com',
    name: 'Test User',
    password: 'password',
}, {
    email: 'alice@gmail.com',
    name: 'Alice',
    password: 'password',
}
]

async function main() {
    try {
        await Promise.all(
            userData.map(async (user) => {
                const insertUser = await db.user.upsert({
                    where: { email: user.email },
                    update: {},
                    create: user
                })
                console.log("User created with id: ", insertUser.id)
            })
        )
    } catch (error) {
        console.error("Error creating user: ", error)
    }
}

main();