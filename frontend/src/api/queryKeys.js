/**
 * Factory for React Query cache keys.
 */
export const queryKeys = {
    programs: {
        all: ['programs'],

        detail: (id) => ['programs', id],
    },
    routines: {
        lastLog: (id) => ['routines', id, 'last-log'],
        today: ['routines', 'today'],
    },
    workouts: {
        history: ['workouts', 'history'],
        detail: (id) => ['workouts', id],
        stats: ['workouts', 'stats'],

        exerciseHistory: (exerciseId) => ['workouts', 'exercise', exerciseId, 'history'],
    },
    exercises: {

        search: (params) => ['exercises', params],
        filters: ['exercises', 'filters'],
    },
    measurements: {
        all: ['measurements'],
    },
    progressPhotos: {
        all: ['progress-photos'],
    },
    profile: {
        detail: (userId) => ['profile', userId],
        achievements: (userId) => ['profile', userId, 'achievements'],
        routines: (userId) => ['profile', userId, 'routines'],
    },
    settings: {
        all: ['settings'],
    },
    chat: {
        sessions: ['chat', 'sessions'],
        messages: (sessionId) => ['chat', 'sessions', sessionId, 'messages'],
    },
};


