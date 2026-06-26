import { Router } from 'express';
import * as rag from '../lib/rag.js';
import { listObservations } from '../lib/rag-observer.js';

const router = Router();

router.post('/ingest', async (req, res) => {
  try { res.status(201).json({id: await rag.ingestDocument(req.body), ok: true}); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.post('/ingest/batch', async (req, res) => {
  const {documents} = req.body as {documents?: rag.IngestParams[]};
  if (!Array.isArray(documents)||!documents.length) return res.status(400).json({error:'documents array required'});
  try { res.status(201).json(await rag.ingestBatch(documents)); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.post('/search', async (req, res) => {
  if (!req.body?.query) return res.status(400).json({error:'query required'});
  try { const r=await rag.searchDocuments(req.body); res.json({results:r,count:r.length}); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.post('/hybrid-search', async (req, res) => {
  if (!req.body?.query) return res.status(400).json({error:'query required'});
  try { const r=await rag.hybridSearchDocuments(req.body); res.json({results:r,count:r.length}); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.get('/observations', async (req, res) => {
  try { const r=await listObservations({collection:req.query.collection as string|undefined,limit:req.query.limit?Number(req.query.limit):undefined}); res.json({observations:r,count:r.length}); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.get('/collections', async (req, res) => {
  try { res.json(await rag.listCollections(req.query.org_id?Number(req.query.org_id):undefined)); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

router.delete('/:id', async (req, res) => {
  try { await rag.deleteDocument(Number(req.params.id)); res.json({ok:true}); }
  catch(e) { res.status(500).json({error:(e as Error).message}); }
});

export default router;
