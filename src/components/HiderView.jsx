function HiderView({ players, currentLocation })
{
    // Filter to get only seekers
    const seekers = players.filter(player => player.is_seeker);

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

    // Find closest seeker
    function getClosestSeekerDistance()
    {
        if (seekers.length === 0 || !currentLocation.latitude || !currentLocation.longitude) return null;

        let minDistance = Infinity;
        seekers.forEach(seeker => {
            const distance = calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                seeker.latitude,
                seeker.longitude
            );
            if (distance !== null && distance < minDistance) {
                minDistance = distance;
            }
        });

        return minDistance === Infinity ? null : minDistance;
    }

    const closestDistance = getClosestSeekerDistance();

    return (
        <div style={{
            backgroundColor: '#f0fff4',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
        }}>
            <h2 style={{ color: '#4CAF50', marginTop: 0 }}>Hider Mode</h2>
            <p style={{ marginBottom: '15px', color: '#333' }}>
                Stay hidden and avoid the seekers!
            </p>

            {seekers.length === 0 ? (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px'
                }}>
                    No seekers in the game - you're safe for now!
                </div>
            ) : (
                <>
                    <div style={{
                        padding: '15px',
                        backgroundColor: 'white',
                        border: '2px solid #4CAF50',
                        borderRadius: '6px',
                        marginBottom: '15px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                            Closest Seeker
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: closestDistance && closestDistance < 100 ? '#ff4444' : '#4CAF50'
                        }}>
                            {formatDistance(closestDistance)}
                        </div>
                    </div>

                    <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
                        Active Seekers: {seekers.length}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {seekers.map((seeker) => {
                            const distance = currentLocation.latitude && currentLocation.longitude && seeker.latitude && seeker.longitude
                                ? calculateDistance(
                                    currentLocation.latitude,
                                    currentLocation.longitude,
                                    seeker.latitude,
                                    seeker.longitude
                                )
                                : null;

                            return (
                                <div
                                    key={seeker.player_id}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: 'white',
                                        border: '1px solid #a5d6a7',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ color: '#333' }}>
                                        <strong>{seeker.name || `Player ${seeker.player_id}`}</strong>
                                    </div>
                                    <div style={{
                                        backgroundColor: distance && distance < 100 ? '#ff4444' : '#4CAF50',
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

export default HiderView;

