import Lesson from '../../../models/Lesson.js';
import { ContentItemModel } from '../../../models/Lesson.js';
const LOG_PREFIX = '[CourseContentController]';
export const addContent = async (req, res) => {
    const lessonId = req.params.lessonId;
    console.log(`${LOG_PREFIX} Adding content to lesson with ID:`, lessonId);
    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            res.status(404).json({ success: false, error: 'Lesson not found' });
            return;
        }
        const contentData = req.body;
        const newContentItem = new ContentItemModel({ ...contentData, lessonId });
        await newContentItem.save();
        await Lesson.findByIdAndUpdate(lessonId, { $push: { contentItems: newContentItem._id } });
        console.log(`${LOG_PREFIX} Content added successfully to lesson:`, lessonId);
        res.status(201).json({
            success: true,
            data: newContentItem,
            message: 'Content added to lesson successfully'
        });
    }
    catch (error) {
        console.error(`${LOG_PREFIX} Error adding content to lesson:`, error);
        res.status(500).json({ success: false, error: 'Server error while adding content to lesson' });
    }
};
export const updateContent = async (req, res) => {
    const contentId = req.params.contentId;
    console.log(`${LOG_PREFIX} Updating content with ID:`, contentId);
    console.log(`${LOG_PREFIX} Update data:`, req.body);
    if (!contentId) {
        console.error(`${LOG_PREFIX} Content ID is undefined`);
        res.status(400).json({ success: false, error: 'Content ID is required' });
        return;
    }
    try {
        const updateData = req.body;
        const updatedContentItem = await ContentItemModel.findByIdAndUpdate(contentId, updateData, { new: true });
        if (!updatedContentItem) {
            console.warn(`${LOG_PREFIX} Content item not found for ID:`, contentId);
            res.status(404).json({ success: false, error: 'Content item not found' });
            return;
        }
        console.log(`${LOG_PREFIX} Successfully updated content item with ID:`, contentId);
        res.json({
            success: true,
            data: updatedContentItem
        });
    }
    catch (error) {
        console.error(`${LOG_PREFIX} Error updating content item:`, error);
        res.status(500).json({ success: false, error: 'Server error while updating content item' });
    }
};
export const deleteContent = async (req, res) => {
    const contentId = req.params.contentId;
    console.log(`${LOG_PREFIX} Deleting content with ID:`, contentId);
    try {
        const deletedContentItem = await ContentItemModel.findByIdAndDelete(contentId);
        if (!deletedContentItem) {
            console.warn(`${LOG_PREFIX} Content item not found for deletion, ID:`, contentId);
            res.status(404).json({ success: false, error: 'Content item not found' });
            return;
        }
        await Lesson.findByIdAndUpdate(deletedContentItem.lessonId, { $pull: { contentItems: contentId } });
        console.log(`${LOG_PREFIX} Successfully deleted content item with ID:`, contentId);
        res.json({ success: true, message: 'Content item deleted successfully' });
    }
    catch (error) {
        console.error(`${LOG_PREFIX} Error deleting content item:`, error);
        res.status(500).json({ success: false, error: 'Server error while deleting content item' });
    }
};
export const getContentItems = async (req, res) => {
    console.log(`${LOG_PREFIX} Received request for content items:`, req.query);
    try {
        let contentItems;
        if (req.params.lessonId) {
            const lessonId = req.params.lessonId;
            console.log(`${LOG_PREFIX} Fetching content items for lesson:`, lessonId);
            contentItems = await ContentItemModel.find({ lessonId });
        }
        else if (req.query.ids) {
            let contentItemIds = Array.isArray(req.query.ids)
                ? req.query.ids
                : req.query.ids.split(',');
            console.log(`${LOG_PREFIX} Fetching content items for IDs:`, contentItemIds);
            contentItems = await ContentItemModel.find({ _id: { $in: contentItemIds } });
        }
        else {
            console.log(`${LOG_PREFIX} Fetching all content items`);
            contentItems = await ContentItemModel.find();
        }
        console.log(`${LOG_PREFIX} Successfully fetched content items`);
        res.json({
            success: true,
            data: contentItems
        });
    }
    catch (error) {
        console.error(`${LOG_PREFIX} Error fetching content items:`, error);
        res.status(500).json({ success: false, error: 'Server error while fetching content items' });
    }
};
export const getCourseContent = async (req, res) => {
    const courseId = req.params.courseId;
    console.log(`${LOG_PREFIX} Fetching content for course:`, courseId);
    try {
        const courseContent = await Lesson.find({ courseId }).populate('contentItems');
        console.log(`${LOG_PREFIX} Successfully fetched course content for course:`, courseId);
        res.json({
            success: true,
            data: courseContent
        }); // Replace 'any' with your specific course content type
    }
    catch (error) {
        console.error(`${LOG_PREFIX} Error fetching course content:`, error);
        res.status(500).json({ success: false, error: 'Server error while fetching course content' });
    }
};
