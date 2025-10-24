import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerTable from './PlayerTable';
import PlayerNameEditor from './PlayerNameEditor';
import RoleSwitcher from './RoleSwitcher';
import SeekerView from './SeekerView';
import HiderView from './HiderView';

function LobbyFound({ lobbyConnection, initialPlayerData, onError, onClearSession })
{
    // Destructure lobby connection data
    const { lobbyId, lobbyName, playerToken } = lobbyConnection;
    
    // Player data with local state for name and role updates
    const [playerName, setPlayerName] = useState(initialPlayerData?.name || '');
    const [isSeeker, setIsSeeker] = useState(initialPlayerData?.is_seeker || false);
    const { player_id } = initialPlayerData || {};

    const navigate = useNavigate();
    
    // State for current location
    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null
    });

    // State for other players in the lobby
    const [otherPlayers, setOtherPlayers] = useState([]);

    // Constants
    const API_BASE = "https://api.hankinit.work/manhunt-api";

    // Function to leave lobby
    async function leaveLobby()
    {
        try {
            await fetch(`${API_BASE}/leave-lobby`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lobby_id: lobbyId,
                    player_token: playerToken
                })
            });
        } catch (error) {
            console.error('Error leaving lobby:', error);
        } finally {
            // Clear saved session when user explicitly leaves
            onClearSession();
            navigate('/');
        }
    }

    // Trade player data with server
    async function tradePlayerData()
    {
        if (!lobbyId || !playerToken || currentLocation.latitude === null || currentLocation.longitude === null) return;
        
        try
        {
            const response = await fetch(`${API_BASE}/trade-player-data`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lobby_id: lobbyId,
                    player_token: playerToken,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude
                })
            });

            if (!response.ok)
            {
                throw new Error('Failed to trade player data');
            }

            const data = await response.json();
            
            // Check for error statuses in the response
            if (data.status === 'lobby_not_found' || data.status === 'invalid_player_token')
            {
                onError(data.status);
                return;
            }
            
            // Filter out current player as an extra safety measure
            const filteredPlayers = data.other_players.filter(player => player.player_id !== player_id);
            setOtherPlayers(filteredPlayers);
        }
        catch (error)
        {
            console.error('Error trading player data:', error);
        }
    }

    // Get current geolocation
    function updateLocation(position)
    {
        setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }

    function getLocation()
    {
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(updateLocation);
        }
    }

    // Effect to get location periodically
    useEffect(() =>
    {
        getLocation();
        const intervalId = setInterval(getLocation, 2000);
        return () => clearInterval(intervalId);
    }, []);

    // Effect to trade player data when location updates
    useEffect(() =>
    {
        if (currentLocation.latitude !== null && currentLocation.longitude !== null)
        {
            tradePlayerData();
            const intervalId = setInterval(tradePlayerData, 2000);
            return () => clearInterval(intervalId);
        }
    }, [currentLocation, lobbyId, playerToken]);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>{lobbyName}</h1>
                    <h6 style={{ margin: '5px 0' }}>{lobbyId}</h6>
                </div>
                <button
                    onClick={leaveLobby}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Leave Lobby
                </button>
            </div>

            <PlayerTable players={otherPlayers} />
            
            <PlayerNameEditor
                currentName={playerName}
                playerId={player_id}
                lobbyId={lobbyId}
                playerToken={playerToken}
                onNameUpdate={setPlayerName}
                onError={onError}
            />

            <RoleSwitcher
                isSeeker={isSeeker}
                playerId={player_id}
                lobbyId={lobbyId}
                playerToken={playerToken}
                onRoleUpdate={setIsSeeker}
                onError={onError}
            />

            {/* Role-specific views - only one is visible at a time */}
            {isSeeker ? (
                <SeekerView 
                    players={otherPlayers}
                    currentLocation={currentLocation}
                />
            ) : (
                <HiderView 
                    players={otherPlayers}
                    currentLocation={currentLocation}
                />
            )}
        </>
    );
}

export default LobbyFound;
