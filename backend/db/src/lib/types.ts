export type ServiceStatus = "Active" | "Pending" | "Suspended" | "Completed";

export interface CityService {
  id: string;
  cityId?: string;
  serviceId?: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  name?: string;
  category?: string;
}

export type CreateCityServiceInput = Omit<
  CityService,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCityServiceInput = Partial<CreateCityServiceInput>;


export interface CityRecord {
  id: string;
  cityName: string;
  pinCode: string;
  serviceCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCityInput = Omit<CityRecord, "id" | "createdAt" | "updatedAt">;
export type UpdateCityInput = Partial<CreateCityInput>;
