import { useState, useEffect } from 'react';

function PlayerTable({ players })
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

    return (
        <>
            <h2>Other Players</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {players.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>
                                No other players in lobby
                            </td>
                        </tr>
                    ) : (
                        players.map((player) => (
                            <tr key={player.player_id}>
                                <td>{player.player_id}</td>
                                <td>{player.name}</td>
                                <td>{player.is_seeker ? 'Seeker' : 'Hider'}</td>
                                <td>{player.latitude?.toFixed(6) || 'N/A'}</td>
                                <td>{player.longitude?.toFixed(6) || 'N/A'}</td>
                                <td>{getTimeAgo(player.location_last_updated)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </>
    );
}

export default PlayerTable;
