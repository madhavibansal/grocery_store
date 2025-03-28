"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserModule_1 = __importDefault(require("../controller/UserModule"));
const validation_1 = __importDefault(require("../middleware/validation"));
const userRoute = (app) => {
    app.post('/customer', validation_1.default.createCustomer, new UserModule_1.default().createCustomer);
    app.get('/customer/:id', new UserModule_1.default().getCustomerById);
    app.put('/customer/:id', validation_1.default.updateCustomer, new UserModule_1.default().updateCustomer);
    app.post('/customer/add-grocery', validation_1.default.addGrocery, new UserModule_1.default().addGroceriesToCustomer);
    app.get('/customer/order/:userId', new UserModule_1.default().getOrderDetails);
    app.put('/customer/order/:userId', validation_1.default.updatePayment, new UserModule_1.default().updatePaymentStatus);
};
exports.default = userRoute;
