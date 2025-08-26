const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const projectService = {
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
          { field: { Name: "color_c" } },
          { field: { Name: "default_billable_c" } },
          { field: { Name: "hourly_rate_c" } },
          { field: { Name: "client_c" } }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await apperClient.fetchRecords('project_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(project => ({
        Id: project.Id,
        name: project.Name,
        color: project.color_c || "#5B4FB6",
        defaultBillable: project.default_billable_c || false,
        hourlyRate: project.hourly_rate_c || 0,
        client: project.client_c || ""
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching projects:", error?.response?.data?.message);
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
          { field: { Name: "color_c" } },
          { field: { Name: "default_billable_c" } },
          { field: { Name: "hourly_rate_c" } },
          { field: { Name: "client_c" } }
        ]
      };

      const response = await apperClient.getRecordById('project_c', id, params);

      if (!response || !response.data) {
        return null;
      }

      const project = response.data;
      return {
        Id: project.Id,
        name: project.Name,
        color: project.color_c || "#5B4FB6",
        defaultBillable: project.default_billable_c || false,
        hourlyRate: project.hourly_rate_c || 0,
        client: project.client_c || ""
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching project with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error);
      }
      return null;
    }
  },

  async create(projectData) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: projectData.name,
          color_c: projectData.color || "#5B4FB6",
          default_billable_c: projectData.defaultBillable || false,
          hourly_rate_c: parseFloat(projectData.hourlyRate) || 0,
          client_c: projectData.client || ""
        }]
      };

      const response = await apperClient.createRecord('project_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create projects ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          const project = successfulRecords[0].data;
          return {
            Id: project.Id,
            name: project.Name,
            color: project.color_c || "#5B4FB6",
            defaultBillable: project.default_billable_c || false,
            hourlyRate: project.hourly_rate_c || 0,
            client: project.client_c || ""
          };
        }
      }
      
      throw new Error("Failed to create project");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating project:", error?.response?.data?.message);
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
          Name: updateData.name,
          color_c: updateData.color,
          default_billable_c: updateData.defaultBillable,
          hourly_rate_c: parseFloat(updateData.hourlyRate) || 0,
          client_c: updateData.client || ""
        }]
      };

      const response = await apperClient.updateRecord('project_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update projects ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const project = successfulUpdates[0].data;
          return {
            Id: project.Id,
            name: project.Name,
            color: project.color_c || "#5B4FB6",
            defaultBillable: project.default_billable_c || false,
            hourlyRate: project.hourly_rate_c || 0,
            client: project.client_c || ""
          };
        }
      }
      
      throw new Error("Failed to update project");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating project:", error?.response?.data?.message);
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

      const response = await apperClient.deleteRecord('project_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete projects ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return response.results.filter(result => result.success).length > 0;
      }

      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting project:", error?.response?.data?.message);
        throw new Error(error?.response?.data?.message);
      } else {
        console.error(error);
        throw error;
      }
    }
  }
};