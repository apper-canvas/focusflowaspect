import tagsData from "@/services/mockData/tags.json";

let tags = [...tagsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const tagService = {
  async getAll() {
    await delay(150);
    return tags.map(tag => ({ ...tag }));
  },

  async getById(id) {
    await delay(100);
    const tag = tags.find(tag => tag.Id === parseInt(id));
    return tag ? { ...tag } : null;
  },

  async create(tagData) {
    await delay(200);
    const newId = Math.max(...tags.map(tag => tag.Id), 0) + 1;
    const newTag = {
      Id: newId,
      ...tagData,
      color: tagData.color || "#7C6FD8"
    };
    
    tags.push(newTag);
    return { ...newTag };
  },

  async update(id, updateData) {
    await delay(200);
    const index = tags.findIndex(tag => tag.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Tag not found");
    }
    
    tags[index] = { ...tags[index], ...updateData };
    return { ...tags[index] };
  },

  async delete(id) {
    await delay(150);
    const index = tags.findIndex(tag => tag.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Tag not found");
    }
    
    const deletedTag = tags.splice(index, 1)[0];
    return { ...deletedTag };
  }
};