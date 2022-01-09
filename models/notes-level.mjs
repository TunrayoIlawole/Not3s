import util from 'util';
import { Note, AbstractNotesStore } from './Notes.mjs';
import level from 'level';
import { default as DBG } from 'debug';
import { resolve } from 'path';
const debug = DBG('notes:notes-level');
const error = DBG('notes:error-level');

let db;

// To connect with the level database
async function connectDB() {
    if (typeof db !== 'undefined' || db) return db;
    // Creates a level instance
    db = await level(
        process.env.LEVELDB_LOCATION || 'notes.level', {
            createIfMissing: true,
            valueEncoding: "json"
        }
    );

    return db;
}

export default class LevelNotesStore extends AbstractNotesStore {
    // Close the database connection
    async close() {
        const _db = db;
        db = undefined;
        return _db ? _db.close() : undefined;
    }

    async update(key, title, body) {
        return crupdate(key, title, body);
    }

    async create(key, title, body) {
        return crupdate(key, title, body);
    }

    async read(key) {
        const db = await connectDB();
        const note = Note.fromJSON(await db.get(key));
        return note;
    }

    async destroy(key) {
        const db = await connectDB();
        await db.del(key);
    }

    async keylist() {
        const db = await connectDB();
        const keyz = [];
        await new Promise((resolve, reject) => {
            db.createKeyStream()
            .on('data', data => keyz.push(data))
            .on('error', err => reject(err))
            .on('end', () => resolve(keyz));
        });
        return keyz;
    }

    async count() {
        const db = await connectDB();
        var total = 0;
        await new Promise((resolve, reject) => {
            db.createKeyStream()
            .on('data', data => total++)
            .on('error', err => reject(err))
            .on('end', () => resolve(total));
        });
        return total;
    }
}

async function crupdate(key, title, body) {
    const db = await connectDB();
    const note = new Note(key, title, body);
    await db.put(key, note.JSON);
    return note;
}

/**
 * createKeyStream - This function uses an event-oriented interface to stream through every database entry, emitting events as it goes.
 */