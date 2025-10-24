import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LobbyFound from '../components/LobbyFound';
import LobbyLoading from '../components/LobbyLoading';
import LobbyError from '../components/LobbyError';
import PlayerNotFound from '../components/PlayerNotFound';

function Lobby()
{
    // Join status enumeration using integers
    const JOIN_STATUS = {
        LOADING: 0,
        SUCCESS: 1,
        NOT_FOUND: 2,
        ERROR: 3,
        PLAYER_NOT_FOUND: 4
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
    const STORAGE_KEY = `manhunt_lobby_${lobbyId}`;

    // Save lobby session to localStorage
    function saveSession(connection, playerData)
    {
        try {
            const sessionData = {
                lobbyConnection: connection,
                initialPlayerData: playerData,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    // Load lobby session from localStorage
    function loadSession()
    {
        try {
            const sessionData = localStorage.getItem(STORAGE_KEY);
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                
                // Check if session has expired (1 day)
                const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day in milliseconds
                if (Date.now() - parsed.timestamp > SESSION_TIMEOUT) {
                    // Session expired, remove it
                    localStorage.removeItem(STORAGE_KEY);
                    return null;
                }
                
                return parsed;
            }
        } catch (error) {
            console.error('Error loading session:', error);
            // If corrupted, remove it
            localStorage.removeItem(STORAGE_KEY);
        }
        return null;
    }

    // Clear lobby session from localStorage
    function clearSession()
    {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }

    // Clean up all expired sessions from localStorage
    function cleanupExpiredSessions()
    {
        try {
            const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day
            const MAX_SESSIONS = 10; // Keep max 10 sessions
            const now = Date.now();
            const sessions = [];
            
            // Find all manhunt lobby sessions
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('manhunt_lobby_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        sessions.push({ 
                            key, 
                            timestamp: data.timestamp || 0,
                            age: now - (data.timestamp || 0)
                        });
                    } catch (e) {
                        // Corrupted session, remove it
                        localStorage.removeItem(key);
                    }
                }
            }
            
            // Remove expired sessions
            sessions.forEach(session => {
                if (session.age > SESSION_TIMEOUT) {
                    localStorage.removeItem(session.key);
                }
            });
            
            // If still too many sessions, keep only the most recent ones
            const remainingSessions = sessions.filter(s => s.age <= SESSION_TIMEOUT);
            if (remainingSessions.length > MAX_SESSIONS) {
                remainingSessions
                    .sort((a, b) => a.timestamp - b.timestamp) // Oldest first
                    .slice(0, remainingSessions.length - MAX_SESSIONS)
                    .forEach(session => localStorage.removeItem(session.key));
            }
            
            console.log(`Cleaned up expired sessions. ${sessions.length} total sessions found.`);
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
        }
    }

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
                    const connection = {
                        lobbyId: lobbyId,
                        lobbyName: lobby_name,
                        playerToken: player_token
                    };
                    setLobbyConnection(connection);
                    
                    // Store initial player data to pass to LobbyFound
                    setInitialPlayerData(player_data);
                    
                    // Save session to localStorage
                    saveSession(connection, player_data);
                    
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
        
        // Clean up expired sessions first
        cleanupExpiredSessions();
        
        // Check if there's a saved session for this lobby
        const savedSession = loadSession();
        
        if (savedSession && savedSession.lobbyConnection && savedSession.initialPlayerData)
        {
            // Restore from saved session
            setLobbyConnection(savedSession.lobbyConnection);
            setInitialPlayerData(savedSession.initialPlayerData);
            setJoinStatus(JOIN_STATUS.SUCCESS);
        }
        else
        {
            // Join as new player
            joinLobby(lobbyId);
        }
        
        hasJoinedLobby.current = true;
    }, [lobbyId]);

    // Handle errors from child components
    function handleError(errorStatus)
    {
        if (errorStatus === 'lobby_not_found')
        {
            setJoinStatus(JOIN_STATUS.NOT_FOUND);
        }
        else if (errorStatus === 'invalid_player_token')
        {
            // Clear session when player token is invalid
            clearSession();
            setJoinStatus(JOIN_STATUS.PLAYER_NOT_FOUND);
        }
        else
        {
            setJoinStatus(JOIN_STATUS.ERROR);
        }
    }

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
                    onError={handleError}
                    onClearSession={clearSession}
                />
            );
        
        case JOIN_STATUS.NOT_FOUND:
            return <LobbyError />;
        
        case JOIN_STATUS.PLAYER_NOT_FOUND:
            return <PlayerNotFound />;
        
        case JOIN_STATUS.ERROR:
            return <LobbyError />;
        
        default:
            return <LobbyError />; // Fallback to error state
    }
}

export default Lobby;