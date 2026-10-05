import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('database.sqlite', (err) => {
    if (err) throw err;
});

export const listPublicSummaries = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT s.id, s.title, s.original_author, u.username as author, t.name as theme
            FROM summaries s
            JOIN users u ON s.user_id = u.id
            JOIN themes t ON s.theme_id = t.id
            WHERE s.visibility = 'public'
            ORDER BY s.creation_date DESC
        `;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const listUserSummaries = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT s.id, s.title, s.visibility,s.original_author, t.name as theme
            FROM summaries s
            JOIN themes t ON s.theme_id = t.id
            WHERE s.user_id = ?
            ORDER BY s.creation_date DESC
        `;
        db.all(sql, [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const getSummaryById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT s.*, u.username as author
            FROM summaries s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `;
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve({ error: 'Riepilogo non trovato' });
            else resolve(row);
        });
    });
};

export const getPagesBySummaryId = (summaryId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT p.*, b.path as image_path, b.num_fields
            FROM pages p
            JOIN backgrounds b ON p.background_id = b.id
            WHERE p.summary_id = ?
            ORDER BY p.page_order ASC
        `;
        db.all(sql, [summaryId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const listThemes = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM themes';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const listBackgroundsByTheme = (themeId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM backgrounds WHERE theme_id = ?';
        db.all(sql, [themeId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const listTemplates = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM templates';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

export const getTemplatesByTheme = (themeId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM templates WHERE theme_id = ?';
    db.all(sql, [themeId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


export const getTemplatePages = (templateId) => {
     return new Promise((resolve, reject) => {
        const sql = `
            SELECT tp.*, b.path as image_path, b.num_fields
            FROM template_pages tp
            JOIN backgrounds b ON tp.background_id = b.id
            WHERE tp.template_id = ?
            ORDER BY tp.page_order ASC
        `;
        db.all(sql, [templateId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


export const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};


export const createSummary = (userId, summary, pages) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO summaries(user_id, theme_id, title, visibility, original_author, original_title, creation_date) 
                     VALUES(?, ?, ?, ?, ?, ?, DATETIME('now'))`;

        db.run(sql, [userId, summary.themeId, summary.title, summary.visibility, summary.originalAuthor, summary.originalTitle], function (err) {
            if (err) {
                reject(err);
                return;
            }
            const summaryId = this.lastID;
            const pagePromises = pages.map((page, index) => {
                return new Promise((res, rej) => {
                    const sqlPage = `INSERT INTO pages(summary_id, background_id, text_content_1, text_content_2, text_content_3, page_order) 
                                     VALUES(?, ?, ?, ?, ?, ?)`;
                    db.run(sqlPage, [summaryId, page.backgroundId, page.text1, page.text2, page.text3, index + 1], function(err) {
                        if(err) rej(err);
                        else res();
                    });
                });
            });

            Promise.all(pagePromises)
                .then(() => resolve(summaryId))
                .catch((err) => reject(err)); 
        });
    });
};

export const updateSummary = (userId, summaryId, summary, pages) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE summaries SET title = ?, visibility = ? WHERE id = ? AND user_id = ?`;
        
        db.run(sql, [summary.title, summary.visibility, summaryId, userId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            if (this.changes === 0) {
                reject({ error: 'Riepilogo non trovato o non tuo' });
                return;
            }
            db.run('DELETE FROM pages WHERE summary_id = ?', [summaryId], (err) => {
                if (err) { reject(err); return; }

                const pagePromises = pages.map((page, index) => {
                    return new Promise((res, rej) => {
                        const sqlPage = `INSERT INTO pages(summary_id, background_id, text_content_1, text_content_2, text_content_3, page_order) 
                                         VALUES(?, ?, ?, ?, ?, ?)`;
                        db.run(sqlPage, [summaryId, page.backgroundId, page.text1, page.text2, page.text3, index + 1], function(err) {
                            if(err) rej(err);
                            else res();
                        });
                    });
                });

                Promise.all(pagePromises)
                    .then(() => resolve(summaryId))
                    .catch((err) => reject(err));
            });
        });
    });
};

export const deleteSummary = (userId, summaryId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM summaries WHERE id = ? AND user_id = ?';
        db.run(sql, [summaryId, userId], function (err) {
            if (err) reject(err);
            else if (this.changes === 0) resolve({ error: 'Riepilogo non trovato o non tuo' }); 
            else resolve(this.changes);
        });
    });
};

export const getSummaryForPlayer = (id) => {
  return new Promise((resolve, reject) => {

    const sqlSummary = 'SELECT id, title FROM summaries WHERE id = ?';
    
    db.get(sqlSummary, [id], (err, summary) => {
      if (err) return reject(err);
      if (!summary) return resolve({ error: 'Riepilogo non trovato' });

      const sqlPages = `
        SELECT p.text_content_1, p.text_content_2, p.text_content_3, b.path 
        FROM pages p
        JOIN backgrounds b ON p.background_id = b.id
        WHERE p.summary_id = ?
        ORDER BY p.id ASC
      `;

      db.all(sqlPages, [id], (err, pages) => {
        if (err) return reject(err);

        resolve({ 
            title: summary.title, 
            pages: pages 
        });
      });
    });
  });
};