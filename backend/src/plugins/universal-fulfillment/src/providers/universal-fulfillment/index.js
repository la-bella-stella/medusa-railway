import { FulfillmentProviderService } from "@medusajs/medusa/dist/services";

class UniversalFulfillmentProvider extends FulfillmentProviderService {
  static identifier = "universal-fulfillment";

  constructor() {
    super();
    console.log("UniversalFulfillmentProvider initialized");
  }

  async getFulfillmentOptions() {
    console.log("getFulfillmentOptions called");
    return [
      {
        id: "universal-shipping",
        name: "Standard Shipping",
        price: 1000 // $10 in cents
      }
    ];
  }

  async validateOption(option) {
    return true;
  }

  async createFulfillment(data, items, order, fulfillment) {
    return { success: true };
  }

  async cancelFulfillment(fulfillment) {
    return { success: true };
  }

  async createReturnFulfillment(data) {
    return { success: true };
  }

  async getFulfillmentDocuments(data) {
    return [];
  }
}

export default UniversalFulfillmentProvider;