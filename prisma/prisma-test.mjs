import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if the OnboardingAnswer model exists
  const answers = await prisma.onboardingAnswer.findMany({
    take: 1,
  });
  console.log("✅ Prisma is working! Found answers:", answers.length);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
