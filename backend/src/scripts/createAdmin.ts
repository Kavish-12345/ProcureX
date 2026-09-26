import 'dotenv/config';
import prisma from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';

// Creates an admin, or promotes an existing account to admin.
//
// ADMIN is deliberately unreachable through signup (signupSchema only accepts
// RETAILER | SUPPLIER), since a public route granting it would be a privilege
// escalation hole. This script is the intended way in — run it locally against
// procurex_db, and on the VM against procurex_prod.
//
//   npm run create-admin -- <email> <password> [name] [businessName] [phone]

async function main() {
  const [email, password, name, businessName, phone] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- <email> <password> [name] [businessName] [phone]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const promoted = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', isActive: true },
    });
    console.log(`Promoted existing account to ADMIN: ${promoted.email}`);
    console.log('Their existing password is unchanged.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      name: name || 'Administrator',
      businessName: businessName || 'ProcureX',
      phone: phone || '9999999999',
      role: 'ADMIN',
    },
  });

  console.log(`Created ADMIN account: ${user.email}`);
}

main()
  .catch((error) => {
    console.error('Failed to create admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
