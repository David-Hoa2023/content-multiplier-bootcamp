import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, strict: false });

export function compile(schema: any) { return ajv.compile(schema); }
export function ensureValid(schema: any, obj: any) {
    const v = compile(schema);
    if (!v(obj)) throw new Error('Schema validation failed: ' + JSON.stringify(v.errors, null, 2));
    return obj;
}
