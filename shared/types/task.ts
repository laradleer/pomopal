/** A task as the API returns it. Dates are ISO strings. */
export type TaskDto = {
  id: number
  title: string
  done: boolean
  /** Completed focus sessions linked to this task. */
  sessionsCount: number
  createdAt: string
}
