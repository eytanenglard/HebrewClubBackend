import Lead from '../../models/Lead.js';
export const getLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        if (status) {
            query.status = status;
        }
        const leads = await Lead.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });
        const totalCount = await Lead.countDocuments(query);
        const response = {
            success: true,
            data: leads,
            totalCount,
            pageSize: limitNumber,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber)
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const createLead = async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        const savedLead = await newLead.save();
        const response = {
            success: true,
            data: savedLead
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;
        const lead = await Lead.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!lead) {
            res.status(404).json({ success: false, error: 'Lead not found' });
            return;
        }
        const response = {
            success: true,
            data: lead
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLead = await Lead.findByIdAndDelete(id);
        if (!deletedLead) {
            res.status(404).json({ success: false, error: 'Lead not found' });
            return;
        }
        const response = {
            success: true,
            data: deletedLead
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export default {
    getLeads,
    createLead,
    updateLead,
    deleteLead,
};
