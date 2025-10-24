import { useNavigate } from 'react-router-dom';

function LobbyError() {
    const navigate = useNavigate();

    const handleRetry = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div>
            <h1>Unable to Join Lobby</h1>
            <p>There was an error connecting to the lobby. This could be due to:</p>
            <ul>
                <li>Network connectivity issues</li>
                <li>Server problems</li>
                <li>Invalid lobby ID</li>
            </ul>
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleRetry} style={{ marginRight: '10px' }}>
                    Try Again
                </button>
                <button onClick={handleGoHome}>
                    Go to Home Page
                </button>
            </div>
        </div>
    );
}

export default LobbyError;
