import Store from 'electron-store';

const schema = {
  github_token: {
    type: 'string',
    default: ''
  },
  user_preferences: {
    type: 'object',
    default: {
      theme: 'dark'
    }
  },
  reports_bulk: {
    type: 'array',
    default: []
  },
  reports_single: {
    type: 'array',
    default: []
  }
};

const store = new Store({ schema });

export default store;
