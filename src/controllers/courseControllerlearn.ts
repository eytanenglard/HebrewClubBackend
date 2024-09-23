import { Request, Response } from 'express';
import Course from '../models/Course';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Bookmark from '../models/Bookmark';

// Course Controllers
export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
};

export const getCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error });
  }
};

// Chapter Controllers
export const getChapters = async (req: Request, res: Response) => {
  try {
    const chapters = await Chapter.find({ course: req.params.courseId });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chapters', error });
  }
};

// Lesson Controllers
export const getLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson', error });
  }
};

export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson progress', error });
  }
};

// Bookmark Controllers
export const addBookmark = async (req: Request, res: Response) => {
  try {
    const { time, label } = req.body;
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const newBookmark = new Bookmark({ time, label, lesson: lesson._id });
    await newBookmark.save();
    lesson.bookmarks.push(newBookmark.lesson);
    await lesson.save();
    res.status(201).json(newBookmark);
  } catch (error) {
    res.status(500).json({ message: 'Error adding bookmark', error });
  }
};

export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const { lessonId, bookmarkId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    await Bookmark.findByIdAndDelete(bookmarkId);
    lesson.bookmarks = lesson.bookmarks.filter(
      (id) => id.toString() !== bookmarkId
    );
    await lesson.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bookmark', error });
  }
};
