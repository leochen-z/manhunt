import { useState, useEffect } from 'react';

function PlayerTable({ players, currentPlayer })
{
    // State to force re-render for time updates
    const [, setTick] = useState(0);

    // Calculate time ago from epoch timestamp
    function getTimeAgo(epochTimestamp)
    {
        if (!epochTimestamp) return 'N/A';
        
        const now = Date.now();
        const msAgo = now - epochTimestamp;
        const secondsAgo = Math.floor(msAgo / 1000);
        
        // Handle future timestamps (clock sync issues)
        if (secondsAgo < 0) return 'Just now';
        
        if (secondsAgo < 5) return 'Just now';
        if (secondsAgo < 60) return `${secondsAgo}s ago`;
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
        return `${Math.floor(secondsAgo / 3600)}h ago`;
    }

    // Effect to update "time ago" display every second
    useEffect(() =>
    {
        const intervalId = setInterval(() =>
        {
            setTick(prev => prev + 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Combine current player and other players
    const allPlayers = currentPlayer ? [currentPlayer, ...players] : players;

    return (
        <div className="player-table-container">
            <table className="player-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {allPlayers.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="no-players-cell">
                                No players in lobby
                            </td>
                        </tr>
                    ) : (
                        allPlayers.map((player, index) => (
                            <tr key={player.player_id || 'current'} className={index === 0 && currentPlayer ? 'current-player-row' : ''}>
                                <td className="player-name-cell">
                                    {player.name || `Player ${player.player_id}`}
                                    {index === 0 && currentPlayer && <span className="current-player-indicator"> (You)</span>}
                                </td>
                                <td>
                                    <span className={`player-role-badge ${player.is_seeker ? 'seeker' : 'hider'}`}>
                                        {player.is_seeker ? 'Seeker' : 'Hider'}
                                    </span>
                                </td>
                                <td className="time-cell">{getTimeAgo(player.location_last_updated)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PlayerTable;
