import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { usersStorage } from '../services/storageService.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token ID:', decoded.id);
    
    if (isDBConnected()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = await usersStorage.findById(decoded.id);
      console.log('Lookup in Storage for ID:', decoded.id, 'Result:', req.user ? 'Found' : 'Not Found');
    }

    if (!req.user) {
      console.log('User not found for token ID:', decoded.id);
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};
