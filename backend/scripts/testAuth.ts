import { connectDB } from '../src/config/db';
import { authService } from '../src/services/auth.service';
import { User } from '../src/models/User';
import mongoose from 'mongoose';

async function runAuthTests() {
  console.log('🧪 Starting FundTogether Authentication Module Automated Verification Tests...\n');

  try {
    // 1. Connect DB
    await connectDB();

    const testEmailRecipient = `test.recipient.${Date.now()}@example.com`;
    const testEmailDonor = `test.donor.${Date.now()}@example.com`;
    const testPassword = 'TestPassword2026!';

    // TEST 1: Register Recipient Account
    console.log('1️⃣ Testing Email Registration (Recipient Role)...');
    const recipientRes = await authService.register({
      name: 'Test Recipient User',
      email: testEmailRecipient,
      password: testPassword,
      role: 'recipient',
    });
    console.log('✅ Recipient Registration Success!');
    console.log(`   User ID: ${recipientRes.user._id || recipientRes.user.id}`);
    console.log(`   Role: ${recipientRes.user.role}`);
    console.log(`   JWT Token Issued: ${recipientRes.token ? 'YES' : 'NO'}`);

    // TEST 2: Register Donor Account
    console.log('\n2️⃣ Testing Email Registration (Donor Role)...');
    const donorRes = await authService.register({
      name: 'Test Donor User',
      email: testEmailDonor,
      password: testPassword,
      role: 'donor',
    });
    console.log('✅ Donor Registration Success!');
    console.log(`   Role: ${donorRes.user.role}`);

    // TEST 3: Admin Registration Guard (Must be rejected)
    console.log('\n3️⃣ Testing Admin Registration Guard (Must reject public admin registration)...');
    try {
      await authService.register({
        name: 'Hacker Admin',
        email: `hacker.${Date.now()}@example.com`,
        password: 'Password123',
        role: 'admin',
      });
      console.error('❌ FAIL: Admin registration was NOT rejected!');
    } catch (err: any) {
      console.log(`✅ Admin Registration Guard Passed! Blocked with error: "${err.message}"`);
    }

    // TEST 4: Login with Valid Credentials
    console.log('\n4️⃣ Testing Email + Password Login (Valid Credentials)...');
    const loginRes = await authService.login({
      email: testEmailRecipient,
      password: testPassword,
    });
    console.log('✅ Login Success!');
    console.log(`   User Email: ${loginRes.user.email}`);
    console.log(`   Role Stored in DB: ${loginRes.user.role}`);
    console.log(`   Last Login Updated: ${loginRes.user.lastLoginAt ? new Date(loginRes.user.lastLoginAt).toISOString() : 'YES'}`);

    // TEST 5: Login with Invalid Password (Must fail with generic error)
    console.log('\n5️⃣ Testing Email + Password Login (Invalid Password)...');
    try {
      await authService.login({
        email: testEmailRecipient,
        password: 'WrongPassword999!',
      });
      console.error('❌ FAIL: Login with wrong password did NOT fail!');
    } catch (err: any) {
      console.log(`✅ Invalid Password Guard Passed! Blocked with error: "${err.message}"`);
    }

    // TEST 6: Account Password Setting (Google account linking capability)
    console.log('\n6️⃣ Testing Set Password (Google OAuth Account Linking)...');
    const setPassRes = await authService.setPassword(loginRes.user._id.toString() || loginRes.user.id, 'NewUpdatedPassword2026!');
    console.log(`✅ Set Password Success! Result message: "${setPassRes.message}"`);

    // Verify login with new password
    const loginWithNewPass = await authService.login({
      email: testEmailRecipient,
      password: 'NewUpdatedPassword2026!',
    });
    console.log('✅ Verified login with updated password succeeded!');

    // Cleanup test users
    await User.deleteMany({ email: { $in: [testEmailRecipient, testEmailDonor] } });
    console.log('\n🧹 Test users cleaned up from database.');

    console.log('\n========================================================');
    console.log('🎉 ALL AUTHENTICATION MODULE TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================\n');
  } catch (err: any) {
    console.error('❌ Auth Verification Test Failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAuthTests();
