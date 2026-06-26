export interface Shot {
  id: string
  title: string
  description: string
  completed: boolean
  /**
   * Whether the AI flagged this shot as one of the ⭐ Svarbiausi kadrai.
   * Optional so legacy projects (saved before this field existed) keep working;
   * those default to false during normalization.
   */
  priority?: boolean
}
