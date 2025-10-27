import { useState, useEffect, useRef } from 'react';

function CompassArrow({ targetLatitude, targetLongitude, currentLocation, targetName, distance })
{
    const [deviceHeading, setDeviceHeading] = useState(0);
    const [compassPermission, setCompassPermission] = useState('unknown'); // 'unknown', 'granted', 'denied', 'unsupported'
    const [accumulatedRotation, setAccumulatedRotation] = useState(0);
    const previousRotationRef = useRef(null);

    // Get device compass heading
    useEffect(() => {
        let permissionGranted = false;

        function handleOrientation(event) {
            // iOS devices: use webkitCompassHeading (true heading relative to North)
            if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
                // webkitCompassHeading gives degrees from North (0-360)
                setDeviceHeading(event.webkitCompassHeading);
            }
            // Android/other devices: use alpha (0-360, where 0 is North)
            else if (event.alpha !== null) {
                setDeviceHeading(event.alpha);
            }
        }

        function handleOrientationAbsolute(event) {
            // Absolute orientation gives true heading on Android devices
            if (event.alpha !== null) {
                setDeviceHeading(360 - event.alpha); // Invert for correct compass direction
            }
        }

        // Detect iOS devices
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Detect Android devices
        const isAndroid = /Android/.test(navigator.userAgent);

        // Only proceed if device is iOS or Android
        if (isIOS || isAndroid) {
            // iOS 13+ requires permission
            if (typeof DeviceOrientationEvent !== 'undefined' && 
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                setCompassPermission('unknown'); // Waiting for user to grant permission
            } else if (isAndroid) {
                // Android devices - no permission needed, directly set up listeners
                permissionGranted = true;
                setCompassPermission('granted');
                // Try absolute orientation first (more accurate for compass)
                if (window.DeviceOrientationEvent) {
                    window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute, true);
                }
                // Fallback to regular orientation
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
        } else {
            setCompassPermission('unsupported');
        }

        return () => {
            if (permissionGranted) {
                window.removeEventListener('deviceorientation', handleOrientation, true);
                window.removeEventListener('deviceorientationabsolute', handleOrientationAbsolute, true);
            }
        };
    }, []);

    // Function to request iOS compass permission (must be called from user gesture)
    async function requestCompassPermission()
    {
        if (typeof DeviceOrientationEvent !== 'undefined' && 
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceOrientationEvent.requestPermission();
                if (permissionState === 'granted') {
                    setCompassPermission('granted');
                    
                    // Set up event listeners
                    function handleOrientation(event) {
                        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
                            setDeviceHeading(event.webkitCompassHeading);
                        } else if (event.alpha !== null) {
                            setDeviceHeading(event.alpha);
                        }
                    }
                    
                    window.addEventListener('deviceorientation', handleOrientation, true);
                } else {
                    setCompassPermission('denied');
                }
            } catch (error) {
                console.error('Error requesting device orientation permission:', error);
                setCompassPermission('denied');
            }
        }
    }

    // Calculate bearing from current location to target
    function calculateBearing(lat1, lon1, lat2, lon2)
    {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;

        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360; // Normalize to 0-360

        return bearing;
    }

    // Format distance for display
    function formatDistance(distance)
    {
        if (distance === null || distance === undefined) return 'Unknown';
        if (distance < 1000) return `${Math.round(distance)}m`;
        return `${(distance / 1000).toFixed(2)}km`;
    }

    // Get bearing to target
    const targetBearing = targetLatitude && targetLongitude && currentLocation.latitude && currentLocation.longitude
        ? calculateBearing(
            currentLocation.latitude,
            currentLocation.longitude,
            targetLatitude,
            targetLongitude
        )
        : null;

    // Calculate arrow rotation (target bearing - device heading)
    // Use accumulated rotation to prevent CSS from seeing large jumps
    const rawRotation = targetBearing !== null ? targetBearing - deviceHeading : 0;
    
    // Calculate the shortest angular difference between new and old rotation
    useEffect(() => {
        // Normalize raw rotation to 0-360
        let normalizedRaw = rawRotation % 360;
        if (normalizedRaw < 0) normalizedRaw += 360;
        
        // First time initialization
        if (previousRotationRef.current === null) {
            previousRotationRef.current = normalizedRaw;
            setAccumulatedRotation(normalizedRaw);
            return;
        }
        
        // Calculate difference from previous rotation
        let diff = normalizedRaw - previousRotationRef.current;
        
        // Normalize difference to -180 to +180 (shortest path)
        if (diff > 180) {
            diff -= 360;
        } else if (diff < -180) {
            diff += 360;
        }
        
        // Only update if there's a meaningful change (avoid floating point noise)
        if (Math.abs(diff) > 0.1) {
            setAccumulatedRotation(prev => prev + diff);
            previousRotationRef.current = normalizedRaw;
        }
    }, [rawRotation]);

    const arrowRotation = accumulatedRotation;

    return (
        <div style={{
            padding: '10px 0',
            textAlign: 'center'
        }}>
            {/* Show message if permission denied */}
            {compassPermission === 'denied' && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    color: '#ff4444'
                }}>
                    Compass access denied. Please enable in device settings.
                </div>
            )}

            {/* Show message if unsupported device */}
            {compassPermission === 'unsupported' && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    color: '#666'
                }}>
                    Compass not available on this device. Arrow shows direction from North.
                </div>
            )}
            
            {/* Compass Circle with Arrow */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '1',
                margin: '0 auto',
                backgroundColor: '#fff',
                border: '4px solid #ff4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: compassPermission === 'granted' || compassPermission === 'unsupported' ? 1 : 0.5,
                boxSizing: 'border-box'
            }}>
                {/* North indicator */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#666',
                    display: compassPermission === 'granted' || compassPermission === 'unsupported' ? 'block' : 'none'
                }}>
                    N
                </div>
                
                {/* Permission request button in center */}
                {compassPermission === 'unknown' && (
                    <button
                        onClick={requestCompassPermission}
                        style={{
                            padding: '0',
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Enable
                    </button>
                )}
                
                {/* Direction Arrow */}
                {(compassPermission === 'granted' || compassPermission === 'unsupported') && (
                    <div style={{
                        fontSize: '60px',
                        transform: `rotate(${arrowRotation}deg)`,
                        transition: 'transform 0.3s ease',
                        color: '#ff4444'
                    }}>
                        ↑
                    </div>
                )}

                {/* Distance display in center */}
                {(compassPermission === 'granted' || compassPermission === 'unsupported') && (
                    <div style={{
                        position: 'absolute',
                        bottom: '35px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#ff4444'
                    }}>
                        {formatDistance(distance)}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CompassArrow;

