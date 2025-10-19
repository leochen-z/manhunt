import { useNavigate } from 'react-router-dom';

function LobbyNotFound() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Lobby Not Found</h1>
            <p>The lobby you're trying to join doesn't exist or has been closed.</p>
            <button onClick={() => navigate('/')}>Go to Home Page</button>
        </div>
    );
}

export default LobbyNotFound;
