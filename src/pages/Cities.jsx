import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonChip,
  IonLabel,
  IonRippleEffect,
} from '@ionic/react'
import { locationOutline, arrowForwardOutline } from 'ionicons/icons'
import { cities } from '../data/cities'

export default function Cities() {
  const navigate = useNavigate()

  return (
    <div className="pt-32 pb-20 bg-[#eaf6ee] min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <IonChip color="success" outline>
          <IonIcon icon={locationOutline} />
          <IonLabel>15 cities live</IonLabel>
        </IonChip>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mt-3">
          Helpr is live in 15 cities
        </h1>
        <p className="mt-3 text-neutral-600 max-w-xl mx-auto">
          Pick your city to see availability and serviced localities.
        </p>
      </div>

      <IonGrid className="max-w-5xl mx-auto px-6 mt-12">
        <IonRow>
          {cities.map((c) => (
            <IonCol size="6" sizeMd="4" sizeLg="2.4" key={c.slug}>
              <IonCard
                button
                onClick={() => navigate(`/cities/${c.slug}`)}
                className="ion-activatable rounded-xl"
              >
                <IonCardContent>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <IonIcon
                        icon={locationOutline}
                        style={{ color: 'var(--ion-color-success, #16a34a)' }}
                      />
                      <span className="font-semibold text-brand-900">{c.name}</span>
                    </div>
                    <IonIcon icon={arrowForwardOutline} color="medium" />
                  </div>
                  <IonRippleEffect />
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
    </div>
  )
}
