import { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert, } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../API';

function Player() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);



  useEffect(() => {
    API.getSummaryForPlayer(id)
      .then(data => {
        if (data.error) {
            setError(data.error);
        } else {
            setSummary(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Errore caricamento player');
        setLoading(false);
      });
  }, [id]);

  
  const nextSlide = () => {
    if (index < summary.pages.length - 1) {
        setIndex(index + 1);
    }
  };

  const prevSlide = () => {
    if (index > 0) {
        setIndex(index - 1);
    }
  };

  if (loading) return <Spinner animation="border" className="m-5" />;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!summary || !summary.pages || summary.pages.length === 0) return <Alert variant="warning" className="m-5">Riepilogo vuoto!</Alert>;
  const page = summary.pages[index];

 return (
   
    <div className="dashboard-container text-center">
      <div className="mb-2 text-center">
          <h1 style={{fontFamily: 'var(--font-code)', letterSpacing: '2px'}}>
             PLAYING: {summary.title.toUpperCase()} {index + 1}/{summary.pages.length}
          </h1>
      </div>

      <div className="player-wrapper">

         <img 
            src={`http://localhost:3001${page.path}`} 
            alt="Slide"
         />


         <div style={{
            background: 'rgba(0,0,0,0.3)', 
            display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', 
            position: 'absolute', top: 0, left: 0, 
            width: '100%', height: '100%',
            textAlign: 'center', padding: '2rem'
         }}>
             {page.text_content_1 && <h1 className="text-white fw-bold mb-3" style={{textShadow: '0 2px 10px #000', fontSize: '3rem'}}>{page.text_content_1}</h1>}
             {page.text_content_2 && <h3 className="text-white mb-3" style={{textShadow: '0 2px 10px #000'}}>{page.text_content_2}</h3>}
             {page.text_content_3 && <p className="text-light fs-5" style={{textShadow: '0 2px 10px #000'}}>{page.text_content_3}</p>}
         </div>

         <Button 
            variant="link" 
            onClick={prevSlide}
            disabled={index === 0}
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: index === 0 ? '#555' : 'var(--neon-cyan)', fontSize: '3rem', textDecoration: 'none' }}
         >
            <i className="bi bi-chevron-left"></i>
         </Button>

         <Button 
            variant="link" 
            onClick={nextSlide}
            disabled={index === summary.pages.length - 1}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: index === summary.pages.length - 1 ? '#555' : 'var(--neon-cyan)', fontSize: '3rem', textDecoration: 'none' }}
         >
            <i className="bi bi-chevron-right"></i>
         </Button>

         <Link to="/" className="btn btn-danger btn-sm" style={{position: 'absolute', top: '20px', right: '20px', opacity: 0.8}}>
            <i className=" bi-x-lg"></i>
         </Link>

      </div>

      <div className="mt-3 w-50" style={{height: '4px', background: '#333', borderRadius: '2px'}}>
          <div style={{
              width: `${((index + 1) / summary.pages.length) * 100}%`,
              height: '100%',
              background: 'var(--neon-cyan)',
              boxShadow: '0 0 10px var(--neon-cyan)',
              transition: 'width 0.3s ease'
          }}></div>
      </div>

    </div>
  );
}

export default Player;