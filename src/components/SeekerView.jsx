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
        <div className="seeker-view">
            {hiders.length === 0 ? (
                <div className="no-targets">
                    No hiders
                </div>
            ) : (
                <>
                    {/* Compass Arrow Display */}
                    {selectedHider && (
                        <div className="compass-container">
                            <CompassArrow
                                targetLatitude={selectedHider.latitude}
                                targetLongitude={selectedHider.longitude}
                                currentLocation={currentLocation}
                                targetName={selectedHider.name || `Player ${selectedHider.player_id}`}
                                distance={selectedDistance}
                            />
                        </div>
                    )}

                    <h3 className="targets-title">
                        Select Target ({hiders.length} hiders)
                    </h3>
                    <div className="targets-list">
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
                                    className={`target-card ${isSelected ? 'selected' : ''}`}
                                >
                                    <div className="target-info">
                                        <strong className="target-name">{hider.name || `Player ${hider.player_id}`}</strong>
                                        {isSelected && <span className="tracking-indicator">● Tracking</span>}
                                    </div>
                                    <div className="target-distance">
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

