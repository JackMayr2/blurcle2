import { api } from '@/lib/api';
import { DistrictWithRelations, DistrictCreateInput } from '@/types';

/**
 * Get district by ID
 */
export async function getDistrict(id: string) {
    return api.get<DistrictWithRelations>(`/api/district/${id}`);
}

/**
 * Get all districts for a consultant
 */
export async function getConsultantDistricts() {
    return api.get<DistrictWithRelations[]>('/api/district');
}

/**
 * Create a new district
 */
export async function createDistrict(data: DistrictCreateInput) {
    return api.post<DistrictWithRelations>('/api/district', data);
}

/**
 * Update a district
 */
export async function updateDistrict(id: string, data: Partial<DistrictCreateInput>) {
    return api.put<DistrictWithRelations>(`/api/district/${id}`, data);
}

/**
 * Delete a district
 */
export async function deleteDistrict(id: string) {
    return api.delete(`/api/district/${id}`);
}

/**
 * District service with all district-related API functions
 */
export const districtService = {
    getDistrict,
    getConsultantDistricts,
    createDistrict,
    updateDistrict,
    deleteDistrict
}; 