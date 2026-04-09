import bcrypt from 'bcryptjs';
import { usersStorage } from './storageService.js';

export const initStorage = async () => {
  try {
    const adminExists = await usersStorage.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await usersStorage.create({
        name: 'Admin',
        email: 'admin@nxtchapter.com',
        password: hashedPassword,
        role: 'admin',
        skillRating: 1000,
        totalQuestionsAnswered: 0,
        recentWeakPoints: []
      });
      console.log('Local JSON Storage: Admin user created (admin@nxtchapter.com / admin123)');
    } else {
      console.log('Local JSON Storage: Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing local storage:', error.message);
  }
};
