import api from "./api";

const notificationService = {

  async getNotifications() {
    const { data } = await api.get("/notifications");
    return data;
  },

  async getUnreadCount() {
    const { data } = await api.get("/notifications/non-lues");
    return data;
  },

  async markRead(id) {
    await api.put(`/notifications/${id}/lue`);
  },

  async markAllRead() {
    await api.put("/notifications/lues");
  },

  async getPreferences() {
    const { data } = await api.get("/notifications/preferences");
    return data;
  },

  async savePreferences(toggles) {
    await api.put("/notifications/preferences", toggles);
  },
};

export default notificationService;