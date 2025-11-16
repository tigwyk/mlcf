import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateUsernames() {
  const users = await prisma.user.findMany();
  
  console.log(`Found ${users.length} users`);
  
  for (const user of users) {
    console.log(`Checking user: ${user.username}`);
    if (user.username.includes(' ')) {
      const words = user.username.split(' ');
      // Check if consecutive words are the same (e.g., "Tigwyk Tigwyk" -> ["Tigwyk", "Tigwyk"])
      const uniqueWords = words.filter((word, i) => i === 0 || word !== words[i-1]);
      const newUsername = uniqueWords.join(' ');
      
      if (newUsername !== user.username) {
        console.log(`Updating user ${user.id}: "${user.username}" -> "${newUsername}"`);
        await prisma.user.update({
          where: { id: user.id },
          data: { username: newUsername }
        });
        console.log('✓ Updated');
      }
    }
  }
  
  console.log('Done!');
  await prisma.$disconnect();
}

fixDuplicateUsernames()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
