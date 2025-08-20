export interface Address {
  id: number;
  addressName: string;
  fullName: string;
  streetAddress: string;
  city: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  addressName: string;
  fullName: string;
  streetAddress: string;
  city: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  addressName?: string;
  fullName?: string;
  streetAddress?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  message: string;
}
