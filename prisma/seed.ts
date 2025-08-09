import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Alice", email: "alice@example.com", password: "password123" },
      { name: "Bob", email: "bob@example.com", password: "password123" },
      { name: "Charlie", email: "charlie@example.com", password: "password123" },
      { name: "Dan", email: "dan@example.com", password: "password123" },
      { name: "Evan", email: "evan@example.com", password: "password123" },
      { name: "Frank", email: "frank@example.com", password: "password123" },
      { name: "Gale", email: "gale@example.com", password: "password123" },
      { name: "Hugh", email: "hugh@example.com", password: "password123" },
      { name: "Ivan", email: "ivan@example.com", password: "password123" },
      { name: "John", email: "john@example.com", password: "password123" },
      { name: "Kelly", email: "kelly@example.com", password: "password123" },
      { name: "Larry", email: "larry@example.com", password: "password123" },
    ],
    
  });
  console.log("Seeded users.");
}

main().finally(() => prisma.$disconnect());
