import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API';

function Main({ user }) {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.getPublicSummaries()
      .then((data) => {
        setSummaries(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Impossibile caricare i riepiloghi pubblici.');
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container fluid className="dashboard-container">
      <h1 className="mb-4">Esplora Riepiloghi Pubblici</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {summaries.length === 0 && !error && (
        <Alert variant="info">Non ci sono ancora riepiloghi pubblici. Sii il primo a crearne uno!</Alert>
      )}

      <Row>
        {summaries.map((s) => (
          <Col key={s.id} md={4} className="mb-4">
            <Card className="h-100 shadow-sm hover-effect">
              <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-start">
                  {s.title}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted" >
                  <small>Di: {s.author || 'Utente ' + s.author}</small>
                  {s.original_author && <small> preso da: {s.original_author || 'Utente ' + s.original_author}</small>}
                </Card.Subtitle>
                
                <div className="mb-3">
                   <Badge bg="info" text="dark">{s.theme || 'Tema ' + s.theme}</Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0 d-flex justify-content-end">
                {user && user.id !== s.user_id && (
                    <Link 
                        to={`/copy/${s.id}`} 
                        className="btn btn-outline-success btn-sm"
                        title="Crea una copia modificabile"
                    >
                        <i className="bi bi-files"></i> Crea Copia
                        
                    </Link>
                )}
                {user && user.id === s.user_id && (
                    <Badge bg="secondary">È tuo</Badge>
                )}
                <Link to={`/view/${s.id}`} className="btn btn-primary btn-sm me-2">
                    <i className="bi bi-play-fill"></i> Guarda
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Main;