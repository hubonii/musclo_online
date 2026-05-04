// React Query key factory module.
export const queryKeys = {
    programs: {
        all: ['programs'],
        // Program detail key format: ['programs', id].
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
        // Exercise history is scoped by exercise id.
        exerciseHistory: (exerciseId) => ['workouts', 'exercise', exerciseId, 'history'],
    },
    exercises: {
        // Search key includes full filter object to separate cache entries per query.
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


