import { useNavigate } from 'react-router-dom';

function PlayerError({ lobbyId }) {
    const navigate = useNavigate();

    const handleRejoin = () => {
        // Navigate to the same lobby to join as a new player
        // We'll need to clear the session and rejoin
        window.location.href = `/lobby/${lobbyId}`;
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div>
            <h1>Player Timed Out</h1>
            <p>Your connection to the lobby has expired. You'll need to rejoin as a new player.</p>
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleRejoin} style={{ marginRight: '10px' }}>
                    Rejoin Lobby
                </button>
                <button onClick={handleGoHome}>
                    Go to Home Page
                </button>
            </div>
        </div>
    );
}

export default PlayerError;

