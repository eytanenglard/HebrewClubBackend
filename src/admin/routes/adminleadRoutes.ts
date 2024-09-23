import express from 'express';
import { getLeads, createLead, updateLead, deleteLead } from '../Controllers/adminLeadController';

const router = express.Router();


// GET /api/admin/leads
router.get('/', getLeads);

// POST /api/admin/leads
router.post('/', createLead);

// PUT /api/admin/leads/:id
router.put('/:id', updateLead);

// DELETE /api/admin/leads/:id
router.delete('/:id', deleteLead);

export default router;