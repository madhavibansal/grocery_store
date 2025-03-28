import UserModule from "../controller/UserModule";
import Validation from "../middleware/validation";

const userRoute = (app:any) => {
    app.post('/customer',Validation.createCustomer ,new UserModule().createCustomer)
    app.get('/customer/:id', new UserModule().getCustomerById)
    app.put('/customer/:id',Validation.updateCustomer, new UserModule().updateCustomer)
    app.post('/customer/add-grocery',Validation.addGrocery, new UserModule().addGroceriesToCustomer)
    app.get('/customer/order/:userId', new UserModule().getOrderDetails)
    app.put('/customer/order/:userId',Validation.updatePayment ,new UserModule().updatePaymentStatus)
}

export default userRoute;