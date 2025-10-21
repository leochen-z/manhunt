import { useState, useEffect } from 'react';
import PlayerTable from './PlayerTable';
import PlayerNameEditor from './PlayerNameEditor';
import RoleSwitcher from './RoleSwitcher';

function LobbyFound({ lobbyConnection, initialPlayerData })
{
    // Destructure lobby connection data
    const { lobbyId, lobbyName, playerToken } = lobbyConnection;
    
    // Player data with local state for name and role updates
    const [playerName, setPlayerName] = useState(initialPlayerData?.name || '');
    const [isSeeker, setIsSeeker] = useState(initialPlayerData?.is_seeker || false);
    const { player_id } = initialPlayerData || {};

    // State for current location
    const [currentLocation, setCurrentLocation] = useState({
        latitude: null,
        longitude: null
    });

    // State for other players in the lobby
    const [otherPlayers, setOtherPlayers] = useState([]);

    // Constants
    const API_BASE = "https://api.hankinit.work/manhunt-api";

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
            <h1>{lobbyName}</h1>
            <h6>Lobby Id: {lobbyId}</h6>

            <PlayerTable players={otherPlayers} />
            
            <PlayerNameEditor
                currentName={playerName}
                playerId={player_id}
                lobbyId={lobbyId}
                playerToken={playerToken}
                onNameUpdate={setPlayerName}
            />

            <RoleSwitcher
                isSeeker={isSeeker}
                playerId={player_id}
                lobbyId={lobbyId}
                playerToken={playerToken}
                onRoleUpdate={setIsSeeker}
            />
        </>
    );
}

export default LobbyFound;
