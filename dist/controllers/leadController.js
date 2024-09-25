import Lead from '../models/Lead';
export const createLead = async (req, res) => {
    try {
        const { name, email, phone, courseInterest } = req.body;
        const newLead = new Lead({ name, email, phone, courseInterest });
        await newLead.save();
        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: newLead
        });
    }
    catch (error) {
        console.error('Error creating lead:', error);
        res.status(400).json({
            success: false,
            error: 'Error creating lead'
        });
    }
};
export const getLeads = async (req, res) => {
    try {
        const leads = await Lead.find();
        res.json({ success: true, data: leads });
    }
    catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
export default {
    createLead,
};
//# sourceMappingURL=leadController.js.map