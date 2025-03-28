import { Application } from "express";
import adminModules from "../controller/AdminModule";

const adminRoute = (app:any) => {
    app.post('/admin/grocery', adminModules.addGroceries)
    app.get('/admin/grocery',  adminModules.getGroceries)
    app.get('/admin/grocery/:id',  adminModules.getGroceryById)
    app.put('/admin/grocery/:id',  adminModules.updateGroceries)
    app.delete('/admin/grocery/:id', adminModules.deleteGroceries)
}

export default adminRoute;