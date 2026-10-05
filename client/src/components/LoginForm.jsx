import { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LoginForm(props) {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    if(username === '' || password === '') {
        setErrorMessage('Username e password non possono essere vuoti');
        return;
    }

    props.login(credentials)
      .then(() => navigate('/')) 
      .catch((err) => { 
        setErrorMessage(err.error || 'Username o password errati'); 
      });
  };

  return (
    <Container className="dashboard-container ">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="mb-3">Login</h2>
          
          {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : null}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={ev => setUsername(ev.target.value)}
                required={true}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={ev => setPassword(ev.target.value)}
                required={true}
              />
            </Form.Group>

            <Button variant="primary" type="submit">Login</Button>
            <Button variant="secondary" className='mx-2' onClick={()=>navigate('/')}>Annulla</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;