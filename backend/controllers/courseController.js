import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Topic } from '../models/Topic.js';
import { coursesStorage, topicsStorage } from '../services/storageService.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

export const getCourses = async (req, res) => {
  try {
    const courses = isDBConnected()
      ? await Course.find().populate('createdBy', 'name').sort({ createdAt: -1 })
      : await coursesStorage.getAll();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = isDBConnected()
      ? await Course.findById(req.params.id).populate('createdBy', 'name')
      : await coursesStorage.findById(req.params.id);
    
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const topics = isDBConnected()
      ? await Topic.find({ courseId: course._id }).sort({ order: 1 })
      : (await topicsStorage.getAll()).filter(t => t.courseId === (course._id || course.id));
    
    res.json(isDBConnected() ? { ...course.toObject(), topics } : { ...course, topics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const userData = {
      title,
      description,
      thumbnail: thumbnail || '',
      createdBy: req.user._id || req.user.id,
    };

    const course = isDBConnected()
      ? await Course.create(userData)
      : await coursesStorage.create(userData);

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, description, thumbnail } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await Topic.deleteMany({ courseId: course._id });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course and its topics deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
