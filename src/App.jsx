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
/*
    <button onClick={getLocation}>Click Me For Location</button>
    <h2>Latitude: {latitude}</h2>
    <h2>Longitude: {longitude}</h2>
    <button onClick={startCompass}>Click Me To Start Compass</button>
    <h2>Heading: {Math.round(heading)}°</h2>
    <div className="compass">
      <img 
      src="arrow.png" 
      className="arrow"
      style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      />
    </div>
*/