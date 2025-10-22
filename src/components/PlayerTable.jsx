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
            <table style={{ 
                width: '100%', 
                marginTop: '10px', 
                borderCollapse: 'collapse',
                fontSize: '14px'
            }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Role</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Latitude</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Longitude</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {players.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                No other players in lobby
                            </td>
                        </tr>
                    ) : (
                        players.map((player) => (
                            <tr key={player.player_id}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.player_id}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.name}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.is_seeker ? 'Seeker' : 'Hider'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.latitude?.toFixed(6) || 'N/A'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{player.longitude?.toFixed(6) || 'N/A'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{getTimeAgo(player.location_last_updated)}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </>
    );
}

export default PlayerTable;
