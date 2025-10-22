import { useState, useEffect } from 'react';
import CompassArrow from './CompassArrow';

function SeekerView({ players, currentLocation })
{
    // Filter to get only hiders
    const hiders = players.filter(player => !player.is_seeker);

    // State for selected hider
    const [selectedHider, setSelectedHider] = useState(null);

    // Auto-select first hider when hiders list changes
    useEffect(() => {
        if (hiders.length > 0 && !selectedHider) {
            setSelectedHider(hiders[0]);
        } else if (hiders.length === 0) {
            setSelectedHider(null);
        } else if (selectedHider) {
            // Check if selected hider still exists in the list
            const stillExists = hiders.find(h => h.player_id === selectedHider.player_id);
            if (!stillExists && hiders.length > 0) {
                setSelectedHider(hiders[0]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hiders.length, selectedHider?.player_id]);

    // Calculate distance between two coordinates (Haversine formula)
    function calculateDistance(lat1, lon1, lat2, lon2)
    {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const distance = R * c; // Distance in meters
        return distance;
    }

    // Format distance for display
    function formatDistance(distance)
    {
        if (distance === null) return 'Unknown';
        if (distance < 1000) return `${Math.round(distance)}m`;
        return `${(distance / 1000).toFixed(2)}km`;
    }

    // Get selected hider distance
    const selectedDistance = selectedHider && currentLocation.latitude && currentLocation.longitude
        ? calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            selectedHider.latitude,
            selectedHider.longitude
        )
        : null;

    return (
        <div style={{
            backgroundColor: '#fff5f5',
            border: '2px solid #ff4444',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
        }}>
            <h2 style={{ color: '#ff4444', marginTop: 0 }}>Seeker Mode</h2>

            {hiders.length === 0 ? (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px'
                }}>
                    No hiders in the game yet
                </div>
            ) : (
                <>
                    {/* Compass Arrow Display */}
                    {selectedHider && (
                        <CompassArrow
                            targetLatitude={selectedHider.latitude}
                            targetLongitude={selectedHider.longitude}
                            currentLocation={currentLocation}
                            targetName={selectedHider.name || `Player ${selectedHider.player_id}`}
                            distance={selectedDistance}
                        />
                    )}

                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
                        Select Target ({hiders.length} hiders)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {hiders.map((hider) => {
                            const distance = currentLocation.latitude && currentLocation.longitude && hider.latitude && hider.longitude
                                ? calculateDistance(
                                    currentLocation.latitude,
                                    currentLocation.longitude,
                                    hider.latitude,
                                    hider.longitude
                                )
                                : null;

                            const isSelected = selectedHider && selectedHider.player_id === hider.player_id;

                            return (
                                <div
                                    key={hider.player_id}
                                    onClick={() => setSelectedHider(hider)}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: isSelected ? '#ffe6e6' : 'white',
                                        border: isSelected ? '2px solid #ff4444' : '1px solid #ffcccc',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ color: '#333' }}>
                                        <strong>{hider.name || `Player ${hider.player_id}`}</strong>
                                        {isSelected && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#ff4444' }}>● Tracking</span>}
                                    </div>
                                    <div style={{
                                        backgroundColor: '#ff4444',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}>
                                        {formatDistance(distance)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default SeekerView;

