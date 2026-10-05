import { useEffect, useState } from 'react';
import { Table, Container, Button, Badge, Spinner, Alert} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../API';

function MySummaries() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    API.getUserSummaries()
      .then((data) => {
        setSummaries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);


  if (loading) return <Spinner animation="border" role="status" className="m-3" />;


  const handleDelete = async (id) => {
    const confirm = window.confirm("Sei sicuro di voler eliminare definitivamente questo riepilogo?");
    if (!confirm) return;
    try {
        await API.deleteSummary(id);
        setSummaries(old => old.filter(s => s.id !== id));
    } catch(err) {
        console.error(err);
    }
}
if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', background: '#000'}}>
            <Spinner animation="border" variant="info" style={{width: '4rem', height: '4rem'}} />
        </div>
    );
  }
  return (
    <Container fluid className="dashboard-container">
      <div className="d-flex justify-content-between align-items-end mb-5 border-bottom border-secondary pb-3">
        <h2 className="text-uppercase" style={{ color: 'var(--neon-cyan)' }}>
           I Miei Riepiloghi
        </h2>
        <Link to="/create" className="btn btn-primary btn-lg">
           + NUOVO RIEPILOGO
        </Link>
      </div>

      {error && <Alert variant="danger" style={{background: 'transparent', border: '1px solid var(--neon-pink)', color: 'var(--neon-pink)'}}>{error}</Alert>}

      {summaries.length === 0 && !error ? (
         <div className="text-center p-5" style={{ border: '1px dashed #333', color: '#555' }}>
            <h4>NESSUN DATO TROVATO</h4>
            <p>Inizia creando un nuovo riepilogo nel sistema.</p>
         </div>
      ) : (
        <div className="table-responsive">
            <Table className="cyber-table align-middle">
              <thead>
                <tr>
                  <th>TITOLO  </th>
                  <th>TEMA</th>
                  <th>VISIBILITÀ</th>
                  <th className="text-end">AZIONI SISTEMA</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-bold">{s.title}
                      {s.original_author && (
           <div style={{ fontSize: '0.75rem', color: 'var(--neon-pink)', fontWeight: 'normal' }}>
              <i className="bi bi-music-note-beamed me-1"></i>
              Remix di: {s.original_author}
           </div>
        )}
                    </td>
                    
                    <td><Badge bg="dark" style={{border: '1px solid #555'}}>{s.theme || 'N/A'}</Badge></td>
                    <td>
                        {s.visibility === 'public' ? 
                            <span style={{color: '#548719'}}>● PUBBLICO</span> : 
                            <span style={{color: '#c4444a'}}>● PRIVATO</span>
                        }
                    </td>
                    <td className="text-end">
                      <Link to={`/view/${s.id}`} className="btn btn-success btn-sm me-2" title="Esegui">
                        <i className="bi bi-play-fill"></i>
                      </Link>
                      <Link to={`/edit/${s.id}`} className="btn btn-primary btn-sm me-2" title="Modifica">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)} title="Formatta">
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        </div>
      )}
    </Container>
  );
}

export default MySummaries;