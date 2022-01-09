import * as express  from 'express';
import { NotesStore as notes } from '../models/notes-store.mjs';
export const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const keylist = await notes.keylist();

    const keyPromises = keylist.map(key => {
      return notes.read(key);
    });
    
    const notelist = await Promise.all(keyPromises);

    res.render('index', { title: 'Notes', notelist: notelist });
  } catch (err) {
    next(err);
  }
});