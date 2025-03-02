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
}]


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
                // create new Project
                const newProject = await db.project.create({
                    data: {
                        name: "Test Project" + Math.random(),
                        description: "This is a test project",
                        ownerId: insertUser.id,
                        projectLocation: "example.com",
                        framework: "NEXT",
                        status: "CREATED"
                    }
                })
                console.log("Project created with id: ", newProject.id);
                // update project
                const updatedProject = await db.project.update({
                    where: { id: newProject.id },
                    data: {
                        status: "ARCHIVED"
                    }
                })
                console.log("Project updated with status: ", updatedProject.status);    
            })
        )
    } catch (error) {
        console.error("Error creating user: ", error)
    }
}

main();