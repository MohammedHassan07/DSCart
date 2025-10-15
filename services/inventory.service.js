import inventoryModel from "../models/inventory.model.js";
import inventoryHistoryModel from "../models/inventoryHistory.model.js";

async function lastInventoryService() {
    const lastInventory = await inventoryModel.findOne().sort({ createdAt: -1 }).select("inventoryNumber")
    return lastInventory
}

async function addInventoryService(data) {
    const inventory = await inventoryModel.create(data)
    return inventory
}

async function addInventoryHistoryService(data) {

    const inventoryHistory = await inventoryHistoryModel.insertMany(data)
    return inventoryHistory
}

export default {
    lastInventoryService,
    addInventoryService,
    addInventoryHistoryService
}