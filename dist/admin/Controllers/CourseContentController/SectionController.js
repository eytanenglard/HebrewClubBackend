import Course from '../../../models/Course';
import Section from '../../../models/Section';
import mongoose from 'mongoose';
export const createSection = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const sectionData = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({ success: false, error: 'Course not found' });
            return;
        }
        const newSection = new Section({
            ...sectionData,
            courseId: courseId
        });
        const savedSection = await newSection.save();
        await Course.findByIdAndUpdate(courseId, { $push: { sections: savedSection._id } });
        res.status(201).json({
            success: true,
            data: savedSection,
            message: 'Section added to course successfully'
        });
    }
    catch (error) {
        console.error('Error adding section to course:', error);
        res.status(500).json({ success: false, error: 'Server error while adding section to course' });
    }
};
export const getSection = async (req, res) => {
    try {
        const sectionId = new mongoose.Types.ObjectId(req.params.id);
        const section = await Section.findById(sectionId).populate('lessons');
        if (!section) {
            res.status(404).json({ success: false, error: 'Section not found' });
            return;
        }
        res.json({ success: true, data: section });
    }
    catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching section' });
    }
};
export const updateSection = async (req, res) => {
    try {
        const sectionId = new mongoose.Types.ObjectId(req.params.id);
        const updateData = req.body;
        const section = await Section.findByIdAndUpdate(sectionId, updateData, { new: true });
        if (!section) {
            res.status(404).json({ success: false, error: 'Section not found' });
            return;
        }
        res.json({
            success: true,
            data: section
        });
    }
    catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ success: false, error: 'Server error while updating section' });
    }
};
export const deleteSection = async (req, res) => {
    try {
        const sectionId = new mongoose.Types.ObjectId(req.params.id);
        const section = await Section.findByIdAndDelete(sectionId);
        if (!section) {
            res.status(404).json({ success: false, error: 'Section not found' });
            return;
        }
        await Course.findByIdAndUpdate(section.courseId, { $pull: { sections: sectionId } });
        res.json({ success: true, message: 'Section deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({ success: false, error: 'Server error while deleting section' });
    }
};
export const getSections = async (req, res) => {
    try {
        const courseId = new mongoose.Types.ObjectId(req.params.courseId);
        const sections = await Section.find({ courseId }).populate('lessons');
        res.json({
            success: true,
            data: sections
        });
    }
    catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ success: false, error: 'Server error while fetching sections' });
    }
};
//# sourceMappingURL=SectionController.js.map