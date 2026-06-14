const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: () => {
    ipcRenderer.send('login');
  },
  logout: () => {
    ipcRenderer.send('logout');
  },
  getToken: async () => {
    const token = await ipcRenderer.invoke('get-token');
    return token;
  },
  onAuthSuccess: (callback) => {
    ipcRenderer.on('auth-success', (event, token) => {
      callback(token);
    });
  },
  onAuthLogout: (callback) => {
    ipcRenderer.on('auth-logout', () => {
      callback();
    });
  },
  fetchAdvancedAnalytics: async (token, repos, username) => {
    return await ipcRenderer.invoke('fetch-advanced-analytics', token, repos, username);
  },
  analyzeJobFit: async (username, jobDescription) => {
    return await ipcRenderer.invoke('analyze-job-fit', username, jobDescription);
  },
  onLoadingProgress: (callback) => {
    ipcRenderer.on('loading-progress', (event, data) => {
      callback(data);
    });
  }
});
