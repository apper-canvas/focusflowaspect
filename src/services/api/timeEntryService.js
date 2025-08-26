const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const timeEntryService = {
  async getAll() {
    await delay(200);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "start_time_c" } },
          { field: { Name: "end_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_c" } },
          { field: { Name: "billable_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "auto_detected_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "Tags" } }
        ],
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('time_entry_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(entry => ({
        Id: entry.Id,
        startTime: entry.start_time_c ? new Date(entry.start_time_c).getTime() : Date.now(),
        endTime: entry.end_time_c ? new Date(entry.end_time_c).getTime() : null,
        duration: entry.duration_c || 0,
        project: entry.project_c?.Name || "Unknown Project",
        projectId: entry.project_c?.Id || null,
        tags: entry.Tags ? entry.Tags.split(',') : [],
        billable: entry.billable_c || false,
        description: entry.description_c || "",
        autoDetected: entry.auto_detected_c || false,
        category: entry.category_c || null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching time entries:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  },

  async getById(id) {
    await delay(150);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "start_time_c" } },
          { field: { Name: "end_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_c" } },
          { field: { Name: "billable_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "auto_detected_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await apperClient.getRecordById('time_entry_c', id, params);

      if (!response || !response.data) {
        return null;
      }

      const entry = response.data;
      return {
        Id: entry.Id,
        startTime: entry.start_time_c ? new Date(entry.start_time_c).getTime() : Date.now(),
        endTime: entry.end_time_c ? new Date(entry.end_time_c).getTime() : null,
        duration: entry.duration_c || 0,
        project: entry.project_c?.Name || "Unknown Project",
        projectId: entry.project_c?.Id || null,
        tags: entry.Tags ? entry.Tags.split(',') : [],
        billable: entry.billable_c || false,
        description: entry.description_c || "",
        autoDetected: entry.auto_detected_c || false,
        category: entry.category_c || null
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching time entry with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async create(entryData) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: entryData.description || "Time Entry",
          start_time_c: entryData.startTime ? new Date(entryData.startTime).toISOString() : new Date().toISOString(),
          end_time_c: entryData.endTime ? new Date(entryData.endTime).toISOString() : null,
          duration_c: entryData.duration || 0,
          project_c: entryData.projectId || null,
          billable_c: entryData.billable || false,
          description_c: entryData.description || "",
          auto_detected_c: entryData.autoDetected || false,
          category_c: entryData.category || null,
          Tags: Array.isArray(entryData.tags) ? entryData.tags.join(',') : ""
        }]
      };

      const response = await apperClient.createRecord('time_entry_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create time entries ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          const entry = successfulRecords[0].data;
          return {
            Id: entry.Id,
            startTime: entry.start_time_c ? new Date(entry.start_time_c).getTime() : Date.now(),
            endTime: entry.end_time_c ? new Date(entry.end_time_c).getTime() : null,
            duration: entry.duration_c || 0,
            project: entry.project_c?.Name || "Unknown Project",
            projectId: entry.project_c?.Id || null,
            tags: entry.Tags ? entry.Tags.split(',') : [],
            billable: entry.billable_c || false,
            description: entry.description_c || "",
            autoDetected: entry.auto_detected_c || false,
            category: entry.category_c || null
          };
        }
      }
      
      throw new Error("Failed to create time entry");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating time entry:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error);
        throw error;
      }
    }
  },

  async update(id, updateData) {
    await delay(250);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.description || "Time Entry",
          start_time_c: updateData.startTime ? new Date(updateData.startTime).toISOString() : undefined,
          end_time_c: updateData.endTime ? new Date(updateData.endTime).toISOString() : null,
          duration_c: updateData.duration,
          project_c: updateData.projectId,
          billable_c: updateData.billable,
          description_c: updateData.description,
          auto_detected_c: updateData.autoDetected,
          category_c: updateData.category,
          Tags: Array.isArray(updateData.tags) ? updateData.tags.join(',') : updateData.tags
        }]
      };

      const response = await apperClient.updateRecord('time_entry_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update time entries ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const entry = successfulUpdates[0].data;
          return {
            Id: entry.Id,
            startTime: entry.start_time_c ? new Date(entry.start_time_c).getTime() : Date.now(),
            endTime: entry.end_time_c ? new Date(entry.end_time_c).getTime() : null,
            duration: entry.duration_c || 0,
            project: entry.project_c?.Name || "Unknown Project",
            projectId: entry.project_c?.Id || null,
            tags: entry.Tags ? entry.Tags.split(',') : [],
            billable: entry.billable_c || false,
            description: entry.description_c || "",
            autoDetected: entry.auto_detected_c || false,
            category: entry.category_c || null
          };
        }
      }
      
      throw new Error("Failed to update time entry");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating time entry:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error);
        throw error;
      }
    }
  },

  async delete(id) {
    await delay(200);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('time_entry_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete time entries ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return response.results.filter(result => result.success).length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting time entry:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error);
        throw error;
      }
    }
  },

  async getByDateRange(startDate, endDate) {
    await delay(250);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "start_time_c" } },
          { field: { Name: "end_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_c" } },
          { field: { Name: "billable_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "auto_detected_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "Tags" } }
        ],
        where: [
          {
            FieldName: "start_time_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [new Date(startDate).toISOString()]
          },
          {
            FieldName: "start_time_c",
            Operator: "LessThanOrEqualTo", 
            Values: [new Date(endDate).toISOString()]
          }
        ],
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('time_entry_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(entry => ({
        Id: entry.Id,
        startTime: entry.start_time_c ? new Date(entry.start_time_c).getTime() : Date.now(),
        endTime: entry.end_time_c ? new Date(entry.end_time_c).getTime() : null,
        duration: entry.duration_c || 0,
        project: entry.project_c?.Name || "Unknown Project",
        projectId: entry.project_c?.Id || null,
        tags: entry.Tags ? entry.Tags.split(',') : [],
        billable: entry.billable_c || false,
        description: entry.description_c || "",
        autoDetected: entry.auto_detected_c || false,
        category: entry.category_c || null
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching time entries by date range:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return [];
    }
  },

  async getActiveEntry() {
    await delay(100);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "start_time_c" } },
          { field: { Name: "end_time_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "project_c" } },
          { field: { Name: "billable_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "auto_detected_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "Tags" } }
        ],
        where: [
          {
            FieldName: "end_time_c",
            Operator: "DoesNotHaveValue",
            Values: []
          }
        ],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('time_entry_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const entry = response.data[0];
      return {
        Id: entry.Id,
        startTime: entry.start_time_c ? new Date(entry.start_time_c).getTime() : Date.now(),
        endTime: entry.end_time_c ? new Date(entry.end_time_c).getTime() : null,
        duration: entry.duration_c || 0,
        project: entry.project_c?.Name || "Unknown Project",
        projectId: entry.project_c?.Id || null,
        tags: entry.Tags ? entry.Tags.split(',') : [],
        billable: entry.billable_c || false,
        description: entry.description_c || "",
        autoDetected: entry.auto_detected_c || false,
        category: entry.category_c || null
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching active time entry:", error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  // Goal management methods
  async getGoals() {
    await delay(150);
    const goals = JSON.parse(localStorage.getItem('userGoals') || '{}');
    return {
      daily: {
        workHours: goals.dailyWorkHours || 8,
        focusSessions: goals.dailyFocusSessions || 5,
        ...goals.daily
      },
      weekly: {
        billableHours: goals.weeklyBillableHours || 40,
        learningTime: goals.weeklyLearningTime || 5,
        ...goals.weekly
      },
      projects: goals.projects || {}
    };
  },

  async updateGoals(goalData) {
    await delay(200);
    const currentGoals = JSON.parse(localStorage.getItem('userGoals') || '{}');
    const updatedGoals = { ...currentGoals, ...goalData };
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    return updatedGoals;
  }
};