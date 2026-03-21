import { Question } from '../models/Question.js';
import { User } from '../models/User.js';

// 1. Fetch the perfect next question for the student
export const getNextQuestion = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all available questions
    const allQuestions = await Question.find();
    
    if (allQuestions.length === 0) {
      return res.status(404).json({ message: 'No questions available in the database' });
    }

    // The Adaptive Engine logic:
    // Sort all questions based on how close their difficulty is to the user's current skill rating.
    const sortedQuestions = allQuestions.sort((a, b) => {
      const differenceA = Math.abs(a.difficultyRating - user.skillRating);
      const differenceB = Math.abs(b.difficultyRating - user.skillRating);
      return differenceA - differenceB;
    });

    // The first question in our sorted list is the closest match to their skill level
    const bestMatchQuestion = sortedQuestions[0];
    
    res.status(200).json(bestMatchQuestion);
  } catch (error) {
    console.error("Error fetching next question:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. Add a new question to the database (Admin/Teacher tool)
export const addQuestion = async (req, res) => {
  try {
    const { title, description, topic, difficultyRating } = req.body;

    if (!title || !description || !topic || !difficultyRating) {
      return res.status(400).json({ message: 'Please provide all question fields' });
    }

    const newQuestion = await Question.create({
      title,
      description,
      topic,
      difficultyRating
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};