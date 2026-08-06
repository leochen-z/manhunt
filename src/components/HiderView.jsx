import { useEffect, useState } from 'react';
import {
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonBadge, IonNote
} from '@ionic/react';
import { calculateDistance, formatDistance } from '../utils/geo';
import { getTimeAgo, isStale } from '../utils/time';

function HiderView({ players, currentLocation })
{
    // Filter to get only seekers
    const seekers = players.filter(player => player.is_seeker);

    // Tick every second so "updated Xs ago" labels stay current
    const [, setTick] = useState(0);
    useEffect(() =>
    {
        const intervalId = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(intervalId);
    }, []);

    if (seekers.length === 0) {
        return (
            <IonNote className="ion-text-center" style={{ display: 'block', padding: 24 }} data-testid="no-seekers">
                No seekers
            </IonNote>
        );
    }

    // Sort by distance, closest first; seekers without a location go last
    const sortedSeekers = seekers
        .map(seeker => ({
            seeker,
            distance: calculateDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                seeker.latitude,
                seeker.longitude
            )
        }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    return (
        <>
            <IonCard className="targets-card" data-testid="seekers-card">
                <IonCardHeader>
                    <IonCardTitle data-testid="seekers-title">
                        Active Seekers
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="targets-card-content">
                    <div className="targets-item-stack" data-testid="seekers-list">
                        {sortedSeekers.map(({ seeker, distance }) => {
                            const danger = distance !== null && distance < 100;
                            const stale = isStale(seeker.location_last_updated) || seeker.connected === false;

                            return (
                                <IonItem
                                    key={seeker.player_id}
                                    lines="none"
                                    data-testid="seeker-card"
                                    className={`targets-item ${stale ? 'player-stale' : ''}`.trim()}
                                >
                                    <IonLabel>
                                        <h2>{seeker.name || `Player ${seeker.player_id}`}</h2>
                                        <p className="player-freshness">
                                            {seeker.connected === false ? 'offline · ' : ''}
                                            {seeker.location_last_updated
                                                ? `updated ${getTimeAgo(seeker.location_last_updated)}`
                                                : 'no location yet'}
                                        </p>
                                    </IonLabel>
                                    <IonBadge
                                        slot="end"
                                        className={danger ? 'distance-badge-danger' : 'distance-badge-safe'}
                                        data-testid="seeker-distance"
                                    >
                                        {danger && <span className="proximity-flag-icon" aria-label="Seeker is close">⚠ </span>}
                                        {formatDistance(distance)}
                                    </IonBadge>
                                </IonItem>
                            );
                        })}
                    </div>
                </IonCardContent>
            </IonCard>
        </>
    );
}

export default HiderView;
