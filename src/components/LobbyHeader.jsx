import { useNavigate } from 'react-router-dom';
import { leaveLobby } from '../utils/api.js';

function LobbyHeader({ lobbyId, lobbyName, playerToken, onClearSession, onOpenPlayerTable })
{
    const navigate = useNavigate();

    // Function to leave lobby
    async function handleLeaveLobby()
    {
        try {
            await leaveLobby(lobbyId, playerToken);
        } catch (error) {
            console.error('Error leaving lobby:', error);
        } finally {
            // Clear saved session when user explicitly leaves
            onClearSession();
            navigate('/');
        }
    }

    return (
        <div className="lobby-header lobby-card-base">
            <div className="lobby-info">
                <h1 className="lobby-title">{lobbyName}</h1>
                <p className="lobby-id">Lobby ID: {lobbyId}</p>
            </div>
            <div className="lobby-header-buttons">
                <button
                    onClick={onOpenPlayerTable}
                    className="view-players-btn"
                >
                    View Players
                </button>
                <button
                    onClick={handleLeaveLobby}
                    className="leave-lobby-btn"
                >
                    Leave Lobby
                </button>
            </div>
        </div>
    );
}

export default LobbyHeader;
