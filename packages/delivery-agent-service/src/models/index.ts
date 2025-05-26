export class DeliveryAgent {
    id: number;
    name: string;
    phoneNumber: string;
    vehicleType: string;

    constructor(id: number, name: string, phoneNumber: string, vehicleType: string) {
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.vehicleType = vehicleType;
    }
}

export const deliveryAgentModel = {
    // Define methods for interacting with the database here
};