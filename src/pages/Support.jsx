import React from 'react'
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonText,
  IonRippleEffect,
} from '@ionic/react'
import { callOutline, mailOutline, chatbubblesOutline } from 'ionicons/icons'
import PageHero from '../components/PageHero'

export default function Support() {
  const channels = [
    {
      icon: callOutline,
      title: 'Call us',
      detail: '+91 9910483315',
      href: 'tel:+919910483315',
      cta: 'Dial now',
    },
    {
      icon: mailOutline,
      title: 'Email us',
      detail: 'help@withhelpr.com',
      href: 'mailto:help@withhelpr.com',
      cta: 'Compose mail',
    },
    {
      icon: chatbubblesOutline,
      title: 'In-app chat',
      detail: 'Open the Helpr app',
      href: '#',
      cta: 'Launch chat',
    },
  ]

  return (
    <div>
      <PageHero
        title="Get in touch with Helpr"
        subtitle="Our support team is available on call and email."
      />

      <section className="py-14">
        <IonGrid className="max-w-4xl mx-auto px-6">
          <IonRow>
            {channels.map((c) => (
              <IonCol size="12" sizeSm="4" key={c.title}>
                <IonCard
                  button
                  href={c.href}
                  className="ion-activatable rounded-2xl"
                >
                  <IonCardContent className="ion-text-center">
                    <IonIcon
                      icon={c.icon}
                      style={{ fontSize: 32, color: 'var(--ion-color-success, #16a34a)' }}
                    />
                    <h3 className="mt-3 font-semibold text-brand-900">{c.title}</h3>
                    <IonText color="medium">
                      <p className="text-sm mt-1">{c.detail}</p>
                    </IonText>
                    <IonButton
                      expand="block"
                      fill="clear"
                      size="small"
                      className="mt-3"
                    >
                      {c.cta}
                    </IonButton>
                    <IonRippleEffect />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </section>
    </div>
  )
}
