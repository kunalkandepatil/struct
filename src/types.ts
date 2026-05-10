export type ParamType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array';

export interface Parameter {
  id: string;
  key: string;
  description: string;
  type: ParamType;
  required: boolean;
  nullable?: boolean;
  
  // Object
  children?: Parameter[];
  additionalProperties?: boolean;
  
  // Array
  itemType?: ParamType;
  minItems?: number | '';
  maxItems?: number | '';
  
  // String / Number / Integer
  enumOptions?: string;
  
  // String only
  format?: 'date-time' | 'date' | 'time' | '';
  
  // Number / Integer only
  minimum?: number | '';
  maximum?: number | '';
  
  showAdvanced?: boolean;
}

export const createParameter = (): Parameter => {
  return {
    id: crypto.randomUUID(),
    description: '',
    key: '',
    type: 'string',
    required: false,
    children: [],
  };
};
