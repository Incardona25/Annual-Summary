import { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../API';

function Editor({ mode = "create" }) {
  const navigate = useNavigate();
  const { id } = useParams(); 


  const [title, setTitle] = useState('');
  const [themeId, setThemeId] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [pages, setPages] = useState([]); 
  const [themes, setThemes] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [originalAuthor, setOriginalAuthor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
        try {
            const user = await API.getUserInfo(); 
            setCurrentUser(user);
        } catch (err) {
        }
    };
    checkUser();
}, []);


  useEffect(() => {
    API.getThemes().then(setThemes).catch(err => setError('Errore caricamento temi'));
  }, []);

  useEffect(() => {
    if (themeId) {
      API.getBackgrounds(themeId)
        .then(imgs => setBackgrounds(imgs))
        .catch(err => console.error("Errore caricamento sfondi", err));
    } else {
      setBackgrounds([]);
    }
  }, [themeId]);



  useEffect(() => {


    if (mode === 'create' && themeId) {
      
      API.getTemplates(themeId)
        .then(temps => {
          
          if (Array.isArray(temps) && temps.length > 0) {

          } else {
          }
          
          setTemplates(temps);
        })
        .catch(err => {
        });
    } else {
      setTemplates([]);
    }
  }, [themeId, mode]);

  const addPage = () => {
    if(backgrounds.length === 0) {
        setError('Devi selezionare prima un tema.');
        return;
    }
    const newPage = {
        backgroundId: backgrounds[0].id,
        text1: '',
        text2: '',
        text3: ''
    };
    setPages([...pages, newPage]);
  };

useEffect(() => {
    if (id && mode !== 'create') {
      setLoading(true);
      API.getSummaryById(id)
        .then(summary => {
          if (mode === 'copy') {
             setTitle(summary.title);
             setVisibility(summary.visibility);
             setOriginalAuthor(summary.author);
          } else {
             setTitle(summary.title);
             setVisibility(summary.visibility);
          }
          
          setThemeId(summary.theme_id);
          const dbPages = summary.pages || [];
          const mappedPages = dbPages.map(p => ({
            backgroundId: p.background_id,
            text1: p.text_content_1 , 
            text2: p.text_content_2 , 
            text3: p.text_content_3 
          }));

          setPages(mappedPages);
          setLoading(false);
        })
        .catch(err => {
          setError('Errore nel caricamento del riepilogo');
          setLoading(false);
        });
    }
  }, [id, mode]);

    useEffect(() => {
        if (currentUser && originalAuthor) {
        if (currentUser.username === originalAuthor) {
            setOriginalAuthor(null);
        }
        }
    }, [currentUser, originalAuthor]);


  const updatePage = (index, field, value) => {
    const newPages = [...pages];
    newPages[index][field] = value;
    setPages(newPages);
  };

  const removePage = (index) => {
    setPages(pages.filter((_, i) => i !== index));
  };

  const movePage = (index, direction) => {
    const newPages = [...pages];
    if (direction === 'up' && index > 0) {
        [newPages[index], newPages[index-1]] = [newPages[index-1], newPages[index]];
    } else if (direction === 'down' && index < newPages.length - 1) {
        [newPages[index], newPages[index+1]] = [newPages[index+1], newPages[index]];
    }
    setPages(newPages);
  };
const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

 

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        const bg = backgrounds.find(b => b.id == page.backgroundId);
        
        if (bg && bg.num_fields > 0) {

            const t1 = bg.num_fields >= 1 && page.text1 && page.text1.trim().length > 0;
            const t2 = bg.num_fields >= 2 && page.text2 && page.text2.trim().length > 0;
            const t3 = bg.num_fields >= 3 && page.text3 && page.text3.trim().length > 0;


            if (!t1 && !t2 && !t3) {
                window.scrollTo(0, 0);
                setError(`La Pagina ${i + 1} è incompleta: devi scrivere almeno un testo!`);
                return; 
            }
        }
    }

    const summaryData = { title, themeId, visibility, originalAuthor: mode === 'copy' ? originalAuthor : null, error };

    try {
        if (mode === 'edit') {
            await API.updateSummary(id, summaryData, pages);
        } else {
            await API.createSummary(summaryData, pages);
        }
        navigate('/my-summaries');
    } catch (err) {
        console.error(err);
        setError(err.error || 'Errore salvataggio');
    }
  };

  if (loading) return <Spinner animation="border" className="m-5" />;


const handleTemplateSelect = async (tplId) => {
     if (tplId === 'reset') {
        setPages([]); 
        setSelectedTemplate("");
        return;
    }
    setSelectedTemplate(tplId);

    if (!tplId) return;

    try {
        const tplPages = await API.getTemplatePages(tplId);
        
        const mappedPages = tplPages.map(p => ({
            backgroundId: p.background_id,
            text1: p.default_text_1,
            text2: p.default_text_2 ,
            text3: p.default_text_3 
        }));
        
        setPages(mappedPages);
        setSelectedTemplate(""); 

    } catch (err) {
        console.error("Errore template:", err);
        setError("Impossibile caricare il template selezionato.");
        setSelectedTemplate(""); 
    }
  };

  return (
    <Container className="dashboard-container">
     <h2 className="mb-4">
        {mode === 'edit' ? 'Modifica Riepilogo' : 
         mode === 'copy' ? 'Crea Copia da Riepilogo' : 
         'Nuovo Riepilogo'}
      </h2> 
      {mode === 'copy' && originalAuthor && (
        <h3 >
         Stai creando una versione remixata del riepilogo di <strong>{originalAuthor}</strong>.
        </h3>
      )}
            
            {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
        </Alert>
        )}

      <Form onSubmit={handleSubmit}>
        <div className="p-3 mb-4 bg-light border rounded">
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className='form-label'>Titolo</Form.Label>
                        <Form.Control type="text" value={title}  maxLength={50} placeholder="Massimo 50 caratteri" onChange={e => setTitle(e.target.value)} required />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Visibilità</Form.Label>
                        <Form.Select value={visibility} onChange={e => setVisibility(e.target.value)}>
                            <option value="public">Pubblico</option>
                            <option value="private">Privato</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tema</Form.Label>
                        <Form.Select 
                            value={themeId} 
                            onChange={e => { setThemeId(e.target.value); setPages([]); }} 
                            required
                            disabled={id ? true : false} 
                        >
                            <option value="">Scegli...</option>
                            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                            <Col md={3}>
                    <Form.Group className="mb-3">
                        <Form.Label>Applica Template</Form.Label>
                        <Form.Select 
                            onChange={e => handleTemplateSelect(e.target.value)}
                           value={selectedTemplate}
                        >
                            <option value="" disabled>-- Scegli --</option>
                            <option value="reset" style={{color: 'var(--neon-pink)', fontWeight: 'bold'}}>
                                    ❌ NESSUN TEMPLATE (Azzera tutto)
                                </option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                        </Row>
        </div>

        <h4 className="mb-3">Pagine ({pages.length})</h4>
          {pages.length < 3 && (
            <Alert variant="warning" className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <div>
                    <strong>Attenzione:</strong> Il riepilogo deve avere almeno <strong>3 pagine</strong> per essere salvato. 
                    (Ne mancano ancora {3 - pages.length})
                </div>
            </Alert>
        )}
        {pages.length === 0 && <Alert className='text-main'>Inizia aggiungendo una pagina col bottone qui sotto.</Alert>}

        {pages.map((page, index) => (
            <Card key={index} className="mb-3 card cyber-card">
                <Card.Header className="d-flex justify-content-between align-items-center card-header-editor">
                    <strong>Pagina {index + 1}</strong>
                    <div>
                        <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => movePage(index, 'up')} disabled={index===0}>↑</Button>
                        <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => movePage(index, 'down')} disabled={index===pages.length-1}>↓</Button>
                        <Button variant="danger" size="sm" onClick={() => removePage(index)}>X</Button>
                    </div>
                </Card.Header>
                <Card.Body stylre={{ backgroundColor: '#050505' }}>
                    <Row>
                        <Col md={4} className="text-center">
                            <Form.Group>
                                <div className="mb-2">
                                    {backgrounds.find(b => b.id == page.backgroundId) && 
                                        <img 
                                            src={`http://localhost:3001${backgrounds.find(b => b.id == page.backgroundId).path}`} 
                                            alt="preview" 
                                            style={{width:'100%', maxHeight:'120px', objectFit:'cover', borderRadius:'4px', border:'1px solid #ccc'}}
                                        />
                                    }
                                </div>
                                <Form.Select 
                                    value={page.backgroundId} 
                                    onChange={e => updatePage(index, 'backgroundId', e.target.value)}
                                >
                                    {backgrounds.map(bg => (
                                        <option key={bg.id} value={bg.id}>Sfondo {bg.id} (Testi: {bg.num_fields})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            {(() => {
                                const selectedBg = backgrounds.find(b => b.id == page.backgroundId);
                                const limit = selectedBg ? selectedBg.num_fields : 3;
                                return (
                                    <>
                                        {limit >= 1 && <Form.Control className="mb-2" placeholder="Testo 1 (max 50 caratteri)" value={page.text1 || ''} onChange={e => updatePage(index, 'text1', e.target.value)} maxLength={50} />}
                                        {limit >= 2 && <Form.Control className="mb-2" placeholder="Testo 2 (max 50 caratteri)" value={page.text2 || ''} onChange={e => updatePage(index, 'text2', e.target.value)} maxLength={50} />}
                                        {limit >= 3 && <Form.Control placeholder="Testo 3 (max 50 caratteri" value={page.text3 || ''} onChange={e => updatePage(index, 'text3', e.target.value)} maxLength={50} />}
                                    </>
                                );
                            })()}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        ))}

        <div className="text-center mb-5">
            <Button variant="outline-primary" onClick={addPage} className="w-100 py-3" style={{borderStyle: 'dashed'}}>
                + Aggiungi Pagina
            </Button>
        </div>
        <div className="d-flex justify-content-between border-top pt-3">
            <Button variant="secondary" onClick={() => navigate('/my-summaries')}>Annulla</Button>
            <Button variant="primary" type="submit" size="lg" disabled={pages.length < 3}>
                {id ? 'Salva Modifiche' : 'Crea Riepilogo'}
            </Button>
        </div>
      </Form>
    </Container>
  );
}

export default Editor;