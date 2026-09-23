type EventHandler = (payload: unknown) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  async emit(event: string, payload?: unknown): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    await Promise.all(
      Array.from(handlers).map((h) =>
        Promise.resolve(h(payload)).catch((err) => {
          console.error(`[event-bus] Error in handler for "${event}":`, err);
        })
      )
    );
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  ATTEMPT_SUBMITTED: 'attempt.submitted',
  ATTEMPT_GRADED: 'attempt.graded',
  COURSE_CREATED: 'course.created',
  COURSE_UPDATED: 'course.updated',
  COURSE_DELETED: 'course.deleted',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_DELETED: 'video.deleted',
  SCREENSHOT_ATTEMPT: 'screenshot.attempt',
  VIDEO_PROGRESS_UPDATED: 'video-progress.updated',
} as const;