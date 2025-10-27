import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';

function App() {
    return (

    <BrowserRouter /*basename="/~leochen05/manhunt-hackathon"*/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby/:lobby_id" element={<Lobby />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App;