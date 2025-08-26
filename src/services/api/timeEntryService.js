import timeEntriesData from "@/services/mockData/timeEntries.json";

let timeEntries = [...timeEntriesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const timeEntryService = {
  async getAll() {
    await delay(200);
    return timeEntries.map(entry => ({ ...entry }));
  },

  async getById(id) {
    await delay(150);
    const entry = timeEntries.find(entry => entry.Id === parseInt(id));
    return entry ? { ...entry } : null;
  },

  async create(entryData) {
    await delay(300);
    const newId = Math.max(...timeEntries.map(entry => entry.Id), 0) + 1;
    const newEntry = {
      Id: newId,
      ...entryData,
      startTime: entryData.startTime || Date.now(),
      endTime: entryData.endTime || null,
      duration: entryData.duration || 0,
      autoDetected: entryData.autoDetected || false
    };
    
    timeEntries.push(newEntry);
    return { ...newEntry };
  },

  async update(id, updateData) {
    await delay(250);
    const index = timeEntries.findIndex(entry => entry.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Time entry not found");
    }
    
    timeEntries[index] = { ...timeEntries[index], ...updateData };
    return { ...timeEntries[index] };
  },

  async delete(id) {
    await delay(200);
    const index = timeEntries.findIndex(entry => entry.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Time entry not found");
    }
    
    const deletedEntry = timeEntries.splice(index, 1)[0];
    return { ...deletedEntry };
  },

  async getByDateRange(startDate, endDate) {
    await delay(250);
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return entryDate >= start && entryDate <= end;
      })
      .map(entry => ({ ...entry }));
  },

  async getActiveEntry() {
    await delay(100);
    const activeEntry = timeEntries.find(entry => !entry.endTime);
    return activeEntry ? { ...activeEntry } : null;
  }
};