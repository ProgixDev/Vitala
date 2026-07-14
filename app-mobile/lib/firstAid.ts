import type { IconName } from '@/components/ui';

type Locale = 'en' | 'fr';
type L = Record<Locale, string>;

export interface FirstAidTopic {
  id: string;
  icon: IconName;
  color: string;
  minRead: number;
  title: L;
  summary: L;
  warning: L;
  steps: { title: L; body: L }[];
}

/**
 * Curated, general first-aid guidance for the Learn hub. This is educational
 * content only — every topic reminds the user to call emergency services first.
 * Keep steps short, universally accepted, and easy to act on under stress.
 */
export const FIRST_AID_TOPICS: FirstAidTopic[] = [
  {
    id: 'cpr',
    icon: 'pulse-outline',
    color: '#F43F5E',
    minRead: 3,
    title: { en: 'CPR & unconscious', fr: 'RCR & personne inconsciente' },
    summary: {
      en: 'What to do when someone is not breathing normally.',
      fr: 'Que faire lorsqu’une personne ne respire pas normalement.',
    },
    warning: {
      en: 'Call emergency services before starting. Only do CPR if the person is unresponsive and not breathing normally.',
      fr: 'Appelez les secours avant de commencer. Ne faites la RCR que si la personne est inconsciente et ne respire pas normalement.',
    },
    steps: [
      {
        title: { en: 'Check response', fr: 'Vérifiez la réaction' },
        body: {
          en: 'Tap the shoulders and shout. If there is no response, call for help immediately.',
          fr: 'Tapotez les épaules et parlez fort. En l’absence de réaction, appelez les secours immédiatement.',
        },
      },
      {
        title: { en: 'Open the airway', fr: 'Ouvrez les voies respiratoires' },
        body: {
          en: 'Tilt the head back, lift the chin, and look for normal breathing for up to 10 seconds.',
          fr: 'Basculez la tête en arrière, soulevez le menton et observez la respiration pendant 10 secondes.',
        },
      },
      {
        title: { en: '30 chest compressions', fr: '30 compressions thoraciques' },
        body: {
          en: 'Push hard and fast in the centre of the chest, about 5 cm deep, twice per second.',
          fr: 'Appuyez fort et vite au centre du thorax, d’environ 5 cm, deux fois par seconde.',
        },
      },
      {
        title: { en: 'Continue until help arrives', fr: 'Continuez jusqu’aux secours' },
        body: {
          en: 'Keep going without long pauses. Swap with someone every 2 minutes if you can.',
          fr: 'Poursuivez sans longues pauses. Relayez-vous toutes les 2 minutes si possible.',
        },
      },
    ],
  },
  {
    id: 'choking',
    icon: 'alert-circle-outline',
    color: '#F59E0B',
    minRead: 2,
    title: { en: 'Choking', fr: 'Étouffement' },
    summary: {
      en: 'Help someone who cannot breathe, cough, or speak.',
      fr: 'Aidez une personne qui ne peut plus respirer, tousser ou parler.',
    },
    warning: {
      en: 'If the person becomes unresponsive, call emergency services and start CPR.',
      fr: 'Si la personne perd connaissance, appelez les secours et commencez la RCR.',
    },
    steps: [
      {
        title: { en: 'Encourage coughing', fr: 'Encouragez la toux' },
        body: {
          en: 'If they can cough, let them try to clear it themselves.',
          fr: 'Si la personne peut tousser, laissez-la tenter de dégager elle-même.',
        },
      },
      {
        title: { en: '5 back blows', fr: '5 tapes dans le dos' },
        body: {
          en: 'Lean them forward and hit firmly between the shoulder blades with the heel of your hand.',
          fr: 'Penchez la personne en avant et frappez fermement entre les omoplates avec le talon de la main.',
        },
      },
      {
        title: { en: '5 abdominal thrusts', fr: '5 compressions abdominales' },
        body: {
          en: 'Stand behind, place a fist above the navel, and pull sharply inward and upward.',
          fr: 'Placez-vous derrière, un poing au-dessus du nombril, et tirez fermement vers vous et vers le haut.',
        },
      },
    ],
  },
  {
    id: 'bleeding',
    icon: 'bandage-outline',
    color: '#EC4899',
    minRead: 2,
    title: { en: 'Severe bleeding', fr: 'Hémorragie grave' },
    summary: {
      en: 'Control heavy bleeding from a wound.',
      fr: 'Maîtrisez un saignement abondant.',
    },
    warning: {
      en: 'Call emergency services for deep wounds, spurting blood, or bleeding that will not stop.',
      fr: 'Appelez les secours en cas de plaie profonde, de sang qui jaillit ou de saignement persistant.',
    },
    steps: [
      {
        title: { en: 'Apply firm pressure', fr: 'Appuyez fermement' },
        body: {
          en: 'Press directly on the wound with a clean cloth or dressing.',
          fr: 'Comprimez directement la plaie avec un linge propre ou un pansement.',
        },
      },
      {
        title: { en: 'Keep pressing', fr: 'Maintenez la pression' },
        body: {
          en: 'Do not lift the cloth to check. Add more on top if it soaks through.',
          fr: 'Ne soulevez pas le linge pour vérifier. Ajoutez-en par-dessus si nécessaire.',
        },
      },
      {
        title: { en: 'Raise and rest', fr: 'Surélevez et rassurez' },
        body: {
          en: 'Raise the injury above heart level if possible and keep the person calm.',
          fr: 'Surélevez la blessure au-dessus du cœur si possible et rassurez la personne.',
        },
      },
    ],
  },
  {
    id: 'burns',
    icon: 'warning-outline',
    color: '#F97316',
    minRead: 2,
    title: { en: 'Burns', fr: 'Brûlures' },
    summary: {
      en: 'Cool and protect a burn the right way.',
      fr: 'Refroidissez et protégez une brûlure correctement.',
    },
    warning: {
      en: 'Seek emergency care for large, deep, or facial burns, or burns on children.',
      fr: 'Consultez en urgence pour les brûlures étendues, profondes, au visage ou chez l’enfant.',
    },
    steps: [
      {
        title: { en: 'Cool with water', fr: 'Refroidissez à l’eau' },
        body: {
          en: 'Run cool (not ice-cold) water over the burn for at least 20 minutes.',
          fr: 'Faites couler de l’eau fraîche (pas glacée) sur la brûlure pendant au moins 20 minutes.',
        },
      },
      {
        title: { en: 'Remove tight items', fr: 'Retirez ce qui serre' },
        body: {
          en: 'Take off rings and tight clothing near the burn before it swells.',
          fr: 'Enlevez bagues et vêtements serrés près de la brûlure avant le gonflement.',
        },
      },
      {
        title: { en: 'Cover loosely', fr: 'Couvrez sans serrer' },
        body: {
          en: 'Cover with cling film or a clean, non-fluffy cloth. Never apply creams or ice.',
          fr: 'Couvrez d’un film alimentaire ou d’un linge propre. N’appliquez ni crème ni glace.',
        },
      },
    ],
  },
];

export function getTopic(id: string): FirstAidTopic | undefined {
  return FIRST_AID_TOPICS.find((t) => t.id === id);
}
