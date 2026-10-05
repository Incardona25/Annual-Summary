import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite3.Database('database.sqlite', (err) => {
    if (err) throw err;
});

function createHash(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 32).toString('hex');
    return { salt, hash };
}

const pwd = createHash('politecnico');

const sql_create_users = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL,
        salt TEXT NOT NULL
    );`;

const sql_create_themes = `
    CREATE TABLE IF NOT EXISTS themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );`;

const sql_create_backgrounds = `
    CREATE TABLE IF NOT EXISTS backgrounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id INTEGER NOT NULL,
        path TEXT NOT NULL,
        num_fields INTEGER NOT NULL,
        FOREIGN KEY(theme_id) REFERENCES themes(id)
    );`;

const sql_create_summaries = `
    CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        theme_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        visibility TEXT NOT NULL CHECK(visibility IN ('public', 'private')),
        creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        original_author TEXT,
        original_title TEXT,
        FOREIGN KEY(theme_id) REFERENCES themes(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );`;

const sql_create_pages = `
    CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        summary_id INTEGER NOT NULL,
        background_id INTEGER NOT NULL, 
        text_content_1 TEXT,
        text_content_2 TEXT,
        text_content_3 TEXT,
        page_order INTEGER NOT NULL,
        FOREIGN KEY(summary_id) REFERENCES summaries(id) ON DELETE CASCADE,
        FOREIGN KEY(background_id) REFERENCES backgrounds(id)
    );`;

const sql_create_templates = `
    CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY(theme_id) REFERENCES themes(id)
    );`;

const sql_create_template_pages = `
    CREATE TABLE IF NOT EXISTS template_pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        background_id INTEGER NOT NULL,
        page_order INTEGER NOT NULL,
        default_text_1 TEXT,
        default_text_2 TEXT,
        default_text_3 TEXT,
        FOREIGN KEY(template_id) REFERENCES templates(id),
        FOREIGN KEY(background_id) REFERENCES backgrounds(id)
    );`;

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS template_pages");
    db.run("DROP TABLE IF EXISTS templates");
    db.run("DROP TABLE IF EXISTS pages");
    db.run("DROP TABLE IF EXISTS summaries");
    db.run("DROP TABLE IF EXISTS backgrounds");
    db.run("DROP TABLE IF EXISTS themes");
    db.run("DROP TABLE IF EXISTS users");

    db.run(sql_create_users);
    db.run(sql_create_themes);
    db.run(sql_create_backgrounds);
    db.run(sql_create_summaries);
    db.run(sql_create_pages);
    db.run(sql_create_templates);
    db.run(sql_create_template_pages);

    const default_users = db.prepare("INSERT INTO users(username, hash, salt) VALUES (?, ?, ?)");
    default_users.run("mario rossi", pwd.hash, pwd.salt); 
    default_users.run("Vinz", pwd.hash, pwd.salt); 
    default_users.run("Incardona", pwd.hash, pwd.salt); 
    default_users.finalize();

    const default_themes = db.prepare("INSERT INTO themes(name) VALUES (?)");
    default_themes.run("Cibo & Ristoranti"); 
    default_themes.run("Cinema & Serie TV"); 
    default_themes.finalize();

    const default_backgrounds = db.prepare("INSERT INTO backgrounds(theme_id, path, num_fields) VALUES (?, ?, ?)");
    
    for(let i=1; i<=3; i++) default_backgrounds.run(1, `/images/food/${i}.jpg`, 1);
    for(let i=4; i<=7; i++) default_backgrounds.run(1, `/images/food/${i}.jpg`, 2);
    for(let i=8; i<=12; i++) default_backgrounds.run(1, `/images/food/${i}.jpg`, 3);

    
    for(let i=1; i<=3; i++) default_backgrounds.run(2, `/images/film/${i}.jpg`, 1);
    for(let i=4; i<=7; i++) default_backgrounds.run(2, `/images/film/${i}.jpg`, 2);
    for(let i=8; i<=12; i++) default_backgrounds.run(2, `/images/film/${i}.jpg`, 3);
    default_backgrounds.finalize();

    const default_templates = db.prepare("INSERT INTO templates(theme_id, title, description) VALUES (?, ?, ?)");

    default_templates.run(1, "Tour Gastronomico", "I migliori piatti dell'anno");     
    default_templates.run(1, "Homemade", "Le mie creazioni in cucina");        
    default_templates.run(2, "Film da Oscar", "I film visti al cinema");         
    default_templates.run(2, "Le serie Preferite", "Le serie divorate sul divano");  
    default_templates.finalize();

    const default_template_pages = db.prepare("INSERT INTO template_pages(template_id, background_id, page_order, default_text_1, default_text_2, default_text_3) VALUES (?,?,?,?,?,?)");
  
    default_template_pages.run(1, 1, 1, "Il mio anno in cibo", null, null); 
    default_template_pages.run(1, 2, 2, "Piatto preferito", "Ristorante Top", null); 
    default_template_pages.run(1, 3, 3, "Colazione", "Pranzo", "Cena"); 
    default_template_pages.run(2, 4, 1, "Le mie creazioni", null, null);
    default_template_pages.run(2, 5, 2, "Ricetta Top", "Occasione Speciale", null);
    default_template_pages.run(2, 6, 3, "Dolce", "Salato", "Bevanda");
    default_template_pages.run(2, 7, 4, "Snack", null, null);
    default_template_pages.run(2, 8, 5, "Crunchy", null, null);

    default_template_pages.run(3, 13, 1, "I film che ho visto", null, null);
    default_template_pages.run(3, 14, 2, "Miglior Attore", "Leonardo Di Caprio", null);
    default_template_pages.run(3, 15, 3, "Regia", "Fotografia", "Scenografia");
    default_template_pages.run(3, 16, 4, "Colonna Sonora", null, null);
    default_template_pages.run(4, 17, 1, "Le serie TV che ho visto", null, null);
    default_template_pages.run(4, 18, 2, "Episodio Preferito", "Motivo", null);
    default_template_pages.run(4, 19, 3, "Personaggio Top", "Caratteristiche", "Perché mi piace");
    default_template_pages.run(4, 20, 4, "Genere Preferito", null, null);
    default_template_pages.run(4, 21, 5, "Colonna Sonora", null, null);
    default_template_pages.run(4, 22, 6, "Curiosità", null, null);

    

    default_template_pages.finalize();



});

db.close();