import express from 'express';
import morgan from 'morgan'; 
import cors from 'cors'; 
import { check, validationResult } from 'express-validator'; 
import session from 'express-session'; 
import passport from 'passport'; 
import LocalStrategy from 'passport-local'; 
import crypto from 'crypto'; 

import * as dao from './dao.mjs';


const app = express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('static')); 

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    try {
        const user = await dao.getUserByUsername(username);
        if (!user) return cb(null, false, { message: 'Username o password errati.' });

        const hashedPassword = crypto.scryptSync(password, user.salt, 32).toString('hex');
        
        if (hashedPassword !== user.hash) {
            return cb(null, false, { message: 'Username o password errati.' });
        }

        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await dao.getUserById(id);
        cb(null, user);
    } catch (err) {
        cb(err, null);
    }
});

app.use(session({
    secret: 'una frase segreta molto lunga e difficile da indovinare',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.authenticate('session'));

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({ error: 'Non autenticato' });
};

app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info);
        req.login(user, (err) => {
            if (err) return next(err);
            return res.json(req.user);
        });
    })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ error: 'Non autenticato' });
    }
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Errore durante il logout' });


    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Errore durante la distruzione sessione' });
      }

      res.clearCookie('connect.sid');
      res.end();
    });
  });
});

app.get('/api/summaries', async (req, res) => {
    try {
        const result = await dao.listPublicSummaries();
        res.json(result);
    } catch (err) {
        res.status(500).end();
    }
});

app.get('/api/summaries/my', isLoggedIn, async (req, res) => {
    try {
        const result = await dao.listUserSummaries(req.user.id);
        res.json(result);
    } catch (err) {
        res.status(500).end();
    }
});

app.get('/api/summaries/:id', async (req, res) => {
    try {
        const summary = await dao.getSummaryById(req.params.id);
        if (summary.error) return res.status(404).json(summary);

        if (summary.visibility === 'private') {
            if (!req.isAuthenticated() || req.user.id !== summary.user_id) {
                return res.status(401).json({ error: 'Non autorizzato a vedere questo riepilogo' });
            }
        }

        const pages = await dao.getPagesBySummaryId(req.params.id);

        res.json({ ...summary, pages: pages });
    } catch (err) {
        res.status(500).end();
    }
});

app.get('/api/player/:id', (req, res) => {
  dao.getSummaryForPlayer(req.params.id)
    .then(result => {
        if(result.error) res.status(404).json(result);
        else res.json(result);
    })
    .catch(err => res.status(500).json(err));
});

app.get('/api/themes', async (req, res) => {
    try {
        const result = await dao.listThemes();
        res.json(result);
    } catch(err) { res.status(500).end(); }
});

app.get('/api/themes/:id/templates',isLoggedIn, async (req, res) => {
  try {
    const templates = await dao.getTemplatesByTheme(req.params.id);
    res.json(templates);
  } catch(err) {
    res.status(500).end(); 
  }
});

app.get('/api/backgrounds/:themeId', isLoggedIn, async (req, res) => {
    try {
        const result = await dao.listBackgroundsByTheme(req.params.themeId);
        res.json(result);
    } catch(err) { res.status(500).end(); }
});

app.get('/api/templates', isLoggedIn, async (req, res) => {
    try {
        const result = await dao.listTemplates();
        res.json(result);
    } catch(err) { res.status(500).end(); }
});

app.get('/api/templates/:id', isLoggedIn, async (req, res) => {
    try {
        const pages = await dao.getTemplatePages(req.params.id);
        res.json(pages);
    } catch(err) { res.status(500).end(); }
});


app.post('/api/summaries', isLoggedIn, [
    check('title').isLength({ min: 1, max: 50 }).withMessage('Il titolo deve esseere tra 1 e 50 caratteri'),
    check('themeId').isInt(),
    check('pages').isArray({ min: 3 }).withMessage('Il riepilogo deve avere almeno 3 pagine'), 
    check('pages.*.text1').optional().isLength({ max: 50 }).withMessage('Il Testo 1 è troppo lungo'),
    check('pages.*.text2').optional().isLength({ max: 50 }).withMessage('Il Testo 2 è troppo lungo'),
    check('pages.*.text3').optional().isLength({ max: 50 }).withMessage('Il Testo 3 è troppo lungo'),
], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let finalOriginalAuthor = req.body.originalAuthor || null;

    if (finalOriginalAuthor === req.user.username) {
        finalOriginalAuthor = null; 
    }

    const summaryData = {
        title: req.body.title,
        themeId: req.body.themeId,
        visibility: req.body.visibility || 'public',
        originalAuthor: req.body.originalAuthor || null,
        originalTitle: req.body.originalTitle || null    
    };
    
    const pages = req.body.pages;

    try {
        const id = await dao.createSummary(req.user.id, summaryData, pages);
        res.status(201).json({ id: id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore nel salvataggio del database' });
    }
});

app.put('/api/summaries/:id', isLoggedIn, [
    check('title').isLength({ min: 1 }),
    check('pages').isArray({ min: 3 }),
], async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const summaryData = {
        title: req.body.title,
        visibility: req.body.visibility
    };

    try {
        await dao.updateSummary(req.user.id, req.params.id, summaryData, req.body.pages);
        res.status(200).json({ message: 'Aggiornato con successo' });
    } catch (err) {
        console.error(err);
        res.status(503).json({ error: 'Errore durante l\'aggiornamento' });
    }
});

app.delete('/api/summaries/:id', isLoggedIn, async (req, res) => {
    try {
        const result = await dao.deleteSummary(req.user.id, req.params.id);
        if (result.error) res.status(404).json(result);
        else res.status(204).end(); 
    } catch (err) {
        res.status(500).end();
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});