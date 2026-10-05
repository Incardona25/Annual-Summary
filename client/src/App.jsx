import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate,Link,useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import Main from './components/Home';
import API from './API';
import LoginForm from './components/LoginForm';
import MySummaries from './components/MySummaries';
import Editor from './components/Editor';
import Player from './components/Player';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = await API.getUserInfo();
        setUser(userInfo);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    const user = await API.login(credentials.username, credentials.password);
    setUser(user);
  };

  const handleLogout = async () => {
    await API.logout();
    setUser(null);
    navigate('/');
  };

  if(loading) return <div>Caricamento...</div>;

  return (
    <>
      <MyNavbar user={user} logout={handleLogout} />
      <Container fluid className="p-0">
        <Routes>
          <Route path="/" element={<Main user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm login={handleLogin} />} />
          <Route path="/my-summaries" element={user ? <MySummaries /> : <Navigate to="/login" />} />
          <Route path="/view/:id" element={<Player />} />
          <Route path="/create" element={user ? <Editor mode="create" /> : <Navigate to="/login" />} />
          <Route path="/edit/:id" element={user ? <Editor mode="edit" /> : <Navigate to="/login" />} />
          <Route path="/copy/:id" element={user ? <Editor mode="copy" /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </>
  );
}



function MyNavbar({ user, logout }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3">
      <Navbar.Brand as={Link} to="/">My Highlights</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>

          {user && <Nav.Link as={Link} to="/my-summaries">I Miei Riepiloghi</Nav.Link>}
        </Nav>
        <Nav>
          {user ? (
            <>
              <Navbar.Text className="me-2">Ciao, {user.username}</Navbar.Text>
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            </>
          ) : (
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default App;