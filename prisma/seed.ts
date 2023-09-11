import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "paul@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("pauliscool", 10);

  const client = await prisma.client.create({
    data: {
      name: "Friendly Bear Labs",
    },
  });

  await prisma.user.create({
    data: {
      email,
      firstName: "Paul",
      lastName: "Henschel",
      role: "SUPER_ADMIN",
      client: {
        connect: { id: client.id },
      },
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  for (let i = 0; i < 5; i++) {
    const client = await prisma.client.create({
      data: {
        name: faker.company.name(),
      },
    });

    await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: "CLIENT_USER",
        client: {
          connect: { id: client.id },
        },
        password: {
          create: {
            hash: await bcrypt.hash("password", 10),
          },
        },
      },
    });

    for (let i = 0; i < 20; i++) {
      await prisma.lead.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          message: faker.lorem.paragraph(),
          client: {
            connect: { id: client.id },
          },
          additionalFields: {
            company: faker.company.name(),
            phone: faker.phone.number(),
            website: faker.internet.url(),
          },
        },
      });
    }
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
