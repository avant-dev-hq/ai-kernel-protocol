import { Router } from 'express';
import * as memory from '../lib/memory.js';

const router = Router();

router.post('/sessions', async (req,res) => {
  try { res.status(201).json(await memory.createSession(req.body)); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.get('/sessions', async (req,res) => {
  const uid=String(req.query.user_id??'');
  if (!uid) return res.status(400).json({error:'user_id required'});
  try { res.json(await memory.listSessions(uid,Number(req.query.limit??20))); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.get('/sessions/:id', async (req,res) => {
  try {
    const s=await memory.getSession(req.params.id);
    if (!s) return res.status(404).json({error:'Session not found'});
    res.json(s);
  } catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.delete('/sessions/:id', async (req,res) => {
  try { await memory.archiveSession(req.params.id); res.json({ok:true}); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.get('/sessions/:id/messages', async (req,res) => {
  try { res.json(await memory.getMessages(req.params.id,Number(req.query.limit??100))); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.post('/sessions/:id/messages', async (req,res) => {
  try { res.status(201).json(await memory.addMessage({session_id:req.params.id,...req.body})); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

export default router;
