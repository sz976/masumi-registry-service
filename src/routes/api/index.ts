import { DependsOnMethod, Routing } from "express-zod-api";
import { healthEndpointGet } from '@/routes/api/health';
import { queryRegistryEntryGet, } from '@/routes/api/registry-entry';
import { queryAPIKeyEndpointGet as queryCentralizedRegistrySourceGet, addAPIKeyEndpointPost as addCentralizedRegistrySourceEndpointPost, updateAPIKeyEndpointPatch, deleteAPIKeyEndpointDelete as deleteCentralizedRegistrySourceEndpointDelete } from "./api-key";
import { capabilityGet } from "./capability";
import { queryRegistrySourceEndpointGet, addRegistrySourceEndpointPost, updateRegistrySourceEndpointPatch, deleteRegistrySourceEndpointDelete } from "./registry-source";
export const apiRouter: Routing = {
    v1: {
        health: healthEndpointGet,
        "registry-entry": new DependsOnMethod({
            get: queryRegistryEntryGet,
        }),
        "api-key": new DependsOnMethod({
            get: queryCentralizedRegistrySourceGet,
            post: addCentralizedRegistrySourceEndpointPost,
            patch: updateAPIKeyEndpointPatch,
            delete: deleteCentralizedRegistrySourceEndpointDelete
        }),
        "capability": new DependsOnMethod({
            get: capabilityGet,
        }),
        "registry-source": new DependsOnMethod({
            get: queryRegistrySourceEndpointGet,
            post: addRegistrySourceEndpointPost,
            patch: updateRegistrySourceEndpointPatch,
            delete: deleteRegistrySourceEndpointDelete
        })
    }
}
