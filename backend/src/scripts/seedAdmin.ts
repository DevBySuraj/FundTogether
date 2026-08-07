import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/User';

async function seedAdmin() {
  try {
    console.log('[SEED] Connecting to MongoDB:', env.mongoUri);
    await mongoose.connect(env.mongoUri);

    // Drop legacy non-sparse indexes if present
    try {
      await User.collection.dropIndex('walletAddress_1');
      console.log('[SEED] Dropped legacy walletAddress_1 non-sparse index.');
    } catch (e: any) {
      // Ignore if index doesn't exist
    }

    const hashedPassword = await bcrypt.hash(env.adminPassword, 10);

    const existingAdmin = await User.findOne({
      $or: [{ email: env.adminEmail.toLowerCase() }, { role: 'admin' }],
    });

    let adminUser: any = null;

    if (existingAdmin) {
      existingAdmin.name = env.adminName;
      existingAdmin.email = env.adminEmail.toLowerCase();
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      adminUser = existingAdmin;
      console.log(`[SEED] Admin account updated successfully! (${adminUser.email})`);
    } else {
      adminUser = await User.create({
        name: env.adminName,
        email: env.adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log(`[SEED] Admin account created successfully!`);
    }

    console.log(`       Name:     ${adminUser.name}`);
    console.log(`       Email:    ${adminUser.email}`);
    console.log(`       Password: ${env.adminPassword}`);
    console.log(`       Role:     ${adminUser.role}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('[SEED ERROR] Failed to seed admin account:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
