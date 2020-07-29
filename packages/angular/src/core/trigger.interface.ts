/**
 * This provides a proper interface for components with a trigger function
 */
export interface TriggerInterface {
    trigger: (name: string, data: any, callee: TriggerInterface) => any
}
