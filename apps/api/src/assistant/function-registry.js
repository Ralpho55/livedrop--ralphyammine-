import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

class FunctionRegistry {
  constructor() {
    this.functions = new Map();
    this.registerDefaultFunctions();
  }

  register(name, schema, handler) {
    this.functions.set(name, { schema, handler });
  }

  getAllSchemas() {
    const schemas = {};
    for (const [name, { schema }] of this.functions) {
      schemas[name] = schema;
    }
    return schemas;
  }

  async execute(name, parameters) {
    console.log(`[FunctionRegistry] Executing ${name}`);
    const func = this.functions.get(name);
    if (!func) {
      throw new Error(`Function ${name} not found`);
    }
    return await func.handler(parameters);
  }

  registerDefaultFunctions() {
    // getOrderStatus function
    this.register('getOrderStatus', {
      name: 'getOrderStatus',
      description: 'Get the status and details of a specific order',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The ID of the order to check'
          }
        },
        required: ['orderId']
      }
    }, async (params) => {
      const { orderId } = params;
      const order = await Order.findById(orderId);
      
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
          orderId
        };
      }

      return {
        success: true,
        order: {
          id: order._id,
          status: order.status,
          total: order.total,
          items: order.items,
          customerId: order.customerId,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          carrier: order.carrier,
          estimatedDelivery: order.estimatedDelivery
        }
      };
    });

    // searchProducts function
    this.register('searchProducts', {
      name: 'searchProducts',
      description: 'Search for products based on query and limit results',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for products'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of products to return',
            default: 10
          }
        },
        required: ['query']
      }
    }, async (params) => {
      const { query, limit = 10 } = params;
      
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      })
      .limit(limit)
      .select('name description price category tags imageUrl stock');

      return {
        success: true,
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          tags: product.tags,
          imageUrl: product.imageUrl,
          stock: product.stock
        })),
        count: products.length,
        query
      };
    });

    // getCustomerOrders function
    this.register('getCustomerOrders', {
      name: 'getCustomerOrders',
      description: 'Get all orders for a specific customer by email',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Customer email address'
          }
        },
        required: ['email']
      }
    }, async (params) => {
      const { email } = params;
      
      // Find customer by email
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return {
          success: false,
          error: 'Customer not found',
          email
        };
      }

      // Get all orders for this customer
      const orders = await Order.find({ customerId: customer._id })
        .sort({ createdAt: -1 })
        .select('status total items createdAt updatedAt carrier estimatedDelivery');

      return {
        success: true,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email
        },
        orders: orders.map(order => ({
          id: order._id,
          status: order.status,
          total: order.total,
          items: order.items,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          carrier: order.carrier,
          estimatedDelivery: order.estimatedDelivery
        })),
        count: orders.length
      };
    });
  }
}

const functionRegistry = new FunctionRegistry();
export default functionRegistry;
