"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminModule_1 = __importDefault(require("../controller/AdminModule"));
const adminRoute = (app) => {
    app.post('/admin/grocery', AdminModule_1.default.addGroceries);
    app.get('/admin/grocery', AdminModule_1.default.getGroceries);
    app.get('/admin/grocery/:id', AdminModule_1.default.getGroceryById);
    app.put('/admin/grocery/:id', AdminModule_1.default.updateGroceries);
    app.delete('/admin/grocery/:id', AdminModule_1.default.deleteGroceries);
};
exports.default = adminRoute;
