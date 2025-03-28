import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

const validate = (schema: yup.ObjectSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req, { abortEarly: false });
      next();
    } catch (error: any) {
      res.status(400).json({ errors: error.errors });
    }
  };

const createCustomerSchema = yup.object({
    body: yup.object({
      name: yup.string().required("name is required"),
      email: yup.string().email("Invalid email format").required("Email is required"),
      address: yup.string().required("address is required"),
    }),
});
const updateCustomerSchema = yup.object({
    body: yup.object({
      name: yup.string().required("name is required"),
      email: yup.string().email("Invalid email format").required("email is required"),
      address: yup.string().required("address is required"),
    }),
});
const addGrocerySchema = yup.object({
    body: yup.object({
      userId: yup.string().required("userId is required"),
      items:yup.array().of(
        yup.object().shape({
            groceryId:yup.number().required("groceryId is required"),
            quantity:yup.number().required("quantity is required")
        })
      )
    }),
});
const updatePaymentSchema = yup.object({
    body: yup.object({
      userId: yup.string().required("userId is required"),
      status: yup.string().required("status is required")
    }),
});

export default  {
    createCustomer:validate(createCustomerSchema),
    updateCustomer:validate(updateCustomerSchema),
    addGrocery:validate(addGrocerySchema),
    updatePayment:validate(updatePaymentSchema)
}