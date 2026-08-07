import { IonPage, IonContent, IonSpinner } from '@ionic/react';

function LobbyLoading() {
    return (
        <IonPage data-testid="loading-page">
            <IonContent className="ion-padding">
                <div className="page-column">
                    <div className="ion-text-center">
                        <IonSpinner name="crescent" style={{ width: 48, height: 48 }} />
                        <h2>Joining Lobby…</h2>
                        <p>Please wait while we connect you to the lobby.</p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}

export default LobbyLoading;
