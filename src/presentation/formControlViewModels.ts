export interface SelectOptionViewModel {
  id: string;
  label: string;
  description?: string;
}

export const moodSelectOptions: SelectOptionViewModel[] = [
  {
    id: 'calm',
    label: 'Calm',
    description: 'For regular diaries',
  },
  {
    id: 'focused',
    label: 'Focused',
    description: 'For work or study',
  },
  {
    id: 'tired',
    label: 'Tired',
    description: 'For recovery and rest',
  },
];

export const tagSelectOptions: SelectOptionViewModel[] = [
  {
    id: 'diary',
    label: 'Diary',
  },
  {
    id: 'mood',
    label: 'Mood',
  },
  {
    id: 'life-log',
    label: 'Life Log',
  },
  {
    id: 'idea',
    label: 'Idea',
  },
];

export const prioritySelectOptions: SelectOptionViewModel[] = [
  {
    id: 'low',
    label: 'Low',
  },
  {
    id: 'normal',
    label: 'Normal',
  },
  {
    id: 'high',
    label: 'High',
  },
];
