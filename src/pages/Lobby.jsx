import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LobbyNotFound from '../components/LobbyNotFound';
import LobbyFound from '../components/LobbyFound';
import LobbyLoading from '../components/LobbyLoading';
import LobbyError from '../components/LobbyError';

function Lobby()
{
    // Join status enumeration using integers
    const JOIN_STATUS = {
        LOADING: 0,
        SUCCESS: 1,
        NOT_FOUND: 2,
        ERROR: 3
    };

    // State for lobby join result
    const [joinStatus, setJoinStatus] = useState(JOIN_STATUS.LOADING);
    
    // Immutable lobby connection data
    const [lobbyConnection, setLobbyConnection] = useState({
        lobbyId: null,
        lobbyName: null,
        playerToken: null
    });
    
    // Initial player data from API response
    const [initialPlayerData, setInitialPlayerData] = useState(null);

    // Constants
    const API_BASE = "https://api.hankinit.work/manhunt-api";
    const { lobby_id: lobbyId } = useParams();
    const hasJoinedLobby = useRef(false);

    // Makes a POST request to join a group given a group ID
    function joinLobby(lobbyId)
    {
        // Set status to loading when starting the join attempt
        setJoinStatus(JOIN_STATUS.LOADING);
        
        // Attempts to join a lobby given a lobby ID
        fetch(`${API_BASE}/join-lobby`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lobby_id: lobbyId })
        })
        .then(response =>
        {
            // If the attempt succeeds, parse JSON and set data
            if (response.ok)
            {
                return response.json().then(data =>
                {
                    const { lobby_name, player_token, player_data } = data;
                    
                    // Set immutable lobby connection data
                    setLobbyConnection({
                        lobbyId: lobbyId,
                        lobbyName: lobby_name,
                        playerToken: player_token
                    });
                    
                    // Store initial player data to pass to LobbyFound
                    setInitialPlayerData(player_data);
                    
                    setJoinStatus(JOIN_STATUS.SUCCESS);
                });
            }
            // If the attempt fails because the lobby was not found, set join state to not found
            else if (response.status === 400)
            {
                setJoinStatus(JOIN_STATUS.NOT_FOUND);
            }
            // If the attempt fails for any other reason, set join state to error
            else
            {
                setJoinStatus(JOIN_STATUS.ERROR);
            }
        })
        .catch(error =>
        {
            console.error('Network error:', error);
            setJoinStatus(JOIN_STATUS.ERROR);
        });
    }

    // Effect to join lobby on component mount
    useEffect(() =>
    {
        if (hasJoinedLobby.current) return;
        joinLobby(lobbyId);
        hasJoinedLobby.current = true;
    }, [lobbyId]);

    // Render based on lobby join result
    switch (joinStatus)
    {
        case JOIN_STATUS.LOADING:
            return <LobbyLoading />;
        
        case JOIN_STATUS.SUCCESS:
            return (
                <LobbyFound
                    lobbyConnection={lobbyConnection}
                    initialPlayerData={initialPlayerData}
                />
            );
        
        case JOIN_STATUS.NOT_FOUND:
            return <LobbyNotFound />;
        
        case JOIN_STATUS.ERROR:
            return <LobbyError />;
        
        default:
            return <LobbyError />; // Fallback to error state
    }
}

export default Lobby;