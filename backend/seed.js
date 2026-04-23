import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Topic } from './models/Topic.js';
import { CodingQuestion } from './models/CodingQuestion.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Clearing existing data...');
    await Course.deleteMany({});
    await Topic.deleteMany({});
    await CodingQuestion.deleteMany({});
    await User.deleteMany({}); // Clear all users for a fresh start

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);
    const adminPasswordHash = await bcrypt.hash('password123', salt);

    // 1. Setup Admins
    console.log('Creating Admins...');
    const admins = await User.insertMany([
      { name: 'System Admin', email: 'admin@nxtchapter.com', password: adminPasswordHash, role: 'admin', skillRating: 2500 },
      { name: 'Sarah TechLead', email: 'sarah@nxtchapter.com', password: adminPasswordHash, role: 'admin', skillRating: 2800 },
      { name: 'David Mentor', email: 'david@nxtchapter.com', password: adminPasswordHash, role: 'admin', skillRating: 2600 }
    ]);
    const adminId = admins[0]._id;

    // 2. Setup High-Profile Students
    console.log('Creating Intelligent Mock Students...');
    const students = await User.insertMany([
      { name: 'Arjun Reddy', email: 'arjun@student.com', password: passwordHash, role: 'student', skillRating: 1850, xp: 12500, level: 62, streak: 45, longestStreak: 60, totalQuestionsAnswered: 350 },
      { name: 'Priya Sharma', email: 'priya@student.com', password: passwordHash, role: 'student', skillRating: 1400, xp: 4200, level: 21, streak: 12, longestStreak: 15, totalQuestionsAnswered: 85 },
      { name: 'Rahul Desai', email: 'rahul@student.com', password: passwordHash, role: 'student', skillRating: 2200, xp: 35000, level: 175, streak: 120, longestStreak: 120, totalQuestionsAnswered: 1200 },
      { name: 'Neha Gupta', email: 'neha@student.com', password: passwordHash, role: 'student', skillRating: 2550, xp: 52000, level: 260, streak: 210, longestStreak: 210, totalQuestionsAnswered: 2400 },
      { name: 'Vikram Singh', email: 'vikram@student.com', password: passwordHash, role: 'student', skillRating: 1650, xp: 8400, level: 42, streak: 25, longestStreak: 40, totalQuestionsAnswered: 150 },
      { name: 'Ananya Patel', email: 'ananya@student.com', password: passwordHash, role: 'student', skillRating: 1950, xp: 18000, level: 90, streak: 65, longestStreak: 80, totalQuestionsAnswered: 500 },
      { name: 'Karthik Iyer', email: 'karthik@student.com', password: passwordHash, role: 'student', skillRating: 1100, xp: 1200, level: 6, streak: 3, longestStreak: 7, totalQuestionsAnswered: 20 },
      { name: 'Sneha Verma', email: 'sneha@student.com', password: passwordHash, role: 'student', skillRating: 2100, xp: 28000, level: 140, streak: 90, longestStreak: 100, totalQuestionsAnswered: 850 },
      { name: 'Aditya Rao', email: 'aditya@student.com', password: passwordHash, role: 'student', skillRating: 2400, xp: 45000, level: 225, streak: 180, longestStreak: 190, totalQuestionsAnswered: 1800 },
      { name: 'Meera Menon', email: 'meera@student.com', password: passwordHash, role: 'student', skillRating: 1750, xp: 10500, level: 52, streak: 35, longestStreak: 50, totalQuestionsAnswered: 220 }
    ]);

    // 3. Create Courses
    console.log('Creating Courses...');
    const courses = await Course.insertMany([
      {
        title: 'Data Structures & Algorithms in JavaScript',
        description: 'Master the fundamental data structures and algorithmic patterns required to ace top-tier tech interviews.',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=80',
        createdBy: adminId
      },
      {
        title: 'Advanced React Architecture',
        description: 'Go beyond the basics and learn how to build scalable, maintainable enterprise React applications.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        createdBy: adminId
      },
      {
        title: 'Python for Machine Learning',
        description: 'A practical, hands-on introduction to machine learning using Python.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        createdBy: adminId
      },
      {
        title: 'Fullstack Web Development with Next.js',
        description: 'Learn modern fullstack development using Next.js 14, App Router, Server Actions, and Prisma.',
        thumbnail: 'https://images.unsplash.com/photo-1618477247222-ac60c747d79b?w=800&auto=format&fit=crop&q=80',
        createdBy: adminId
      },
      {
        title: 'Mastering SQL & Database Design',
        description: 'From basic queries to advanced window functions, indexing, and scalable database architecture.',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
        createdBy: adminId
      },
      {
        title: 'System Design for Interviews',
        description: 'A comprehensive guide to cracking system design interviews at FAANG companies.',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        createdBy: adminId
      }
    ]);

    // 4. Create Topics & Coding Questions
    console.log('Creating Topics & Coding Questions...');
    
    // Course 0: DSA (5 Topics)
    const topicArrays = await Topic.create({ title: 'Arrays & Strings', order: 1, courseId: courses[0]._id, videoUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', cheatsheet: '# Arrays Cheatsheet\nO(1) access, O(N) search.' });
    const topicHashMaps = await Topic.create({ title: 'Hash Maps & Sets', order: 2, courseId: courses[0]._id, videoUrl: 'https://www.youtube.com/watch?v=KN3AqwMAJtw', cheatsheet: '# Hash Maps\nO(1) lookup average.' });
    const topicLinkedLists = await Topic.create({ title: 'Linked Lists', order: 3, courseId: courses[0]._id, videoUrl: 'https://www.youtube.com/watch?v=Hj_rA0dhr2I', cheatsheet: '# Linked Lists\nFast insertion/deletion. O(N) access.' });
    const topicTrees = await Topic.create({ title: 'Trees & Graphs', order: 4, courseId: courses[0]._id, videoUrl: 'https://www.youtube.com/watch?v=oSWTXtMglKE', cheatsheet: '# Trees\nDFS, BFS traversals.' });
    const topicDP = await Topic.create({ title: 'Dynamic Programming', order: 5, courseId: courses[0]._id, videoUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', cheatsheet: '# Dynamic Programming\nMemoization and Tabulation.' });
    
    await CodingQuestion.create([
      { title: 'Two Sum', description: 'Find two numbers that add up to target.', topic: 'Arrays', difficultyRating: 800, topicId: topicArrays._id, testCases: [{ input: '[2,7,11,15], 9', expectedOutput: '[0, 1]', isHidden: false }] },
      { title: 'Valid Anagram', description: 'Check if t is an anagram of s.', topic: 'Hash Maps', difficultyRating: 1000, topicId: topicHashMaps._id, testCases: [{ input: '"rat", "car"', expectedOutput: 'false', isHidden: false }] },
      { title: 'Reverse Linked List', description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', topic: 'Linked Lists', difficultyRating: 1200, topicId: topicLinkedLists._id, testCases: [{ input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false }] },
      { title: 'Invert Binary Tree', description: 'Given the root of a binary tree, invert the tree, and return its root.', topic: 'Trees', difficultyRating: 1100, topicId: topicTrees._id, testCases: [{ input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isHidden: false }] },
      { title: 'Climbing Stairs', description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. How many distinct ways can you climb to the top?', topic: 'Dynamic Programming', difficultyRating: 900, topicId: topicDP._id, testCases: [{ input: '2', expectedOutput: '2', isHidden: false }, { input: '3', expectedOutput: '3', isHidden: false }] }
    ]);

    // Course 1: React (5 topics)
    await Topic.insertMany([
      { title: 'Advanced React Hooks', order: 1, courseId: courses[1]._id, videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', cheatsheet: '# Hooks\nUseMemo, UseCallback.' },
      { title: 'State Management with Redux', order: 2, courseId: courses[1]._id, videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', cheatsheet: '# Redux\nActions, Reducers, Store.' },
      { title: 'React Router Advanced', order: 3, courseId: courses[1]._id, videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', cheatsheet: '# React Router\nLoaders, Actions, Error boundaries.' },
      { title: 'Performance Optimization', order: 4, courseId: courses[1]._id, videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', cheatsheet: '# Performance\nReact.memo, code splitting.' },
      { title: 'Testing React Apps', order: 5, courseId: courses[1]._id, videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q', cheatsheet: '# Testing\nJest, React Testing Library.' }
    ]);
    
    // Course 2: Python (5 topics)
    await Topic.insertMany([
      { title: 'Python Fundamentals', order: 1, courseId: courses[2]._id, videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', cheatsheet: '# Python\nVariables, Loops, Functions.' },
      { title: 'Object Oriented Programming', order: 2, courseId: courses[2]._id, videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', cheatsheet: '# OOP\nClasses, Inheritance, Polymorphism.' },
      { title: 'Data Analysis with Pandas', order: 3, courseId: courses[2]._id, videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', cheatsheet: '# Pandas\nDataFrames, Series.' },
      { title: 'Machine Learning Basics', order: 4, courseId: courses[2]._id, videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', cheatsheet: '# ML\nScikit-learn, Regression, Classification.' },
      { title: 'Deep Learning with PyTorch', order: 5, courseId: courses[2]._id, videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', cheatsheet: '# PyTorch\nTensors, Neural Networks.' }
    ]);
    
    // Course 3: Next.js (5 topics)
    await Topic.insertMany([
      { title: 'Next.js App Router Basics', order: 1, courseId: courses[3]._id, videoUrl: 'https://www.youtube.com/watch?v=vwSlYG7hFk0', cheatsheet: '# App Router\nFile based routing.' },
      { title: 'Server vs Client Components', order: 2, courseId: courses[3]._id, videoUrl: 'https://www.youtube.com/watch?v=vwSlYG7hFk0', cheatsheet: '# SSR vs CSR\nUse "use client" for interactivity.' },
      { title: 'Data Fetching & Caching', order: 3, courseId: courses[3]._id, videoUrl: 'https://www.youtube.com/watch?v=vwSlYG7hFk0', cheatsheet: '# Fetch API\nfetch() is cached by default in Next.js.' },
      { title: 'Server Actions', order: 4, courseId: courses[3]._id, videoUrl: 'https://www.youtube.com/watch?v=vwSlYG7hFk0', cheatsheet: '# Server Actions\nAsync functions executed on the server.' },
      { title: 'Authentication with Auth.js', order: 5, courseId: courses[3]._id, videoUrl: 'https://www.youtube.com/watch?v=vwSlYG7hFk0', cheatsheet: '# NextAuth\nEasy OAuth integration.' }
    ]);

    // Course 4: SQL (5 topics)
    await Topic.insertMany([
      { title: 'Intro to Relational Databases', order: 1, courseId: courses[4]._id, videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', cheatsheet: '# RDBMS\nTables, rows, primary keys.' },
      { title: 'Joins & Subqueries', order: 2, courseId: courses[4]._id, videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', cheatsheet: '# Joins\nINNER, LEFT, RIGHT, FULL.' },
      { title: 'Indexes & Optimization', order: 3, courseId: courses[4]._id, videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', cheatsheet: '# Indexes\nB-Trees, Hash indexes.' },
      { title: 'Transactions & ACID', order: 4, courseId: courses[4]._id, videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', cheatsheet: '# ACID\nAtomicity, Consistency, Isolation, Durability.' },
      { title: 'Window Functions', order: 5, courseId: courses[4]._id, videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', cheatsheet: '# OVER Clause\nPARTITION BY, ORDER BY.' }
    ]);

    // Course 5: System Design (5 topics)
    await Topic.insertMany([
      { title: 'Scaling Fundamentals', order: 1, courseId: courses[5]._id, videoUrl: 'https://www.youtube.com/watch?v=bUHFg8Cj-Ro', cheatsheet: '# Scaling\nVertical vs Horizontal scaling.' },
      { title: 'Load Balancing', order: 2, courseId: courses[5]._id, videoUrl: 'https://www.youtube.com/watch?v=bUHFg8Cj-Ro', cheatsheet: '# Load Balancers\nRound Robin, Least Connections.' },
      { title: 'Caching Strategies', order: 3, courseId: courses[5]._id, videoUrl: 'https://www.youtube.com/watch?v=bUHFg8Cj-Ro', cheatsheet: '# Caching\nWrite-through, Write-around, Write-back.' },
      { title: 'Database Sharding', order: 4, courseId: courses[5]._id, videoUrl: 'https://www.youtube.com/watch?v=bUHFg8Cj-Ro', cheatsheet: '# Sharding\nHorizontal partitioning of data.' },
      { title: 'Microservices Architecture', order: 5, courseId: courses[5]._id, videoUrl: 'https://www.youtube.com/watch?v=bUHFg8Cj-Ro', cheatsheet: '# Microservices\nDecoupled, independently deployable services.' }
    ]);

    console.log('Massive Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
