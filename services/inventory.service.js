import inventoryModel from "../models/inventory.model.js";

async function lastInventoryService() {
    const lastInventory = await inventoryModel.find().sort({ createdAt: -1 })
    return lastInventory
}

async function addInventoryService(data) {
    const inventory = await inventoryModel.create(data)
    return inventory
}

async function addInventoryHistoryService(data) {
 
    const inventoryHistory = await inventoryModel.insertMany(data)
    return inventoryHistory
}

export default {
    lastInventoryService,
    addInventoryService,
    addInventoryHistoryService
}