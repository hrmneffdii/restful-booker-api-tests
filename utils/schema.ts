import Ajv from 'ajv';
import { expect } from '@playwright/test';

const ajv = new Ajv({ allErrors: true });

export function expectValidSchema(schema: object, data: unknown) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
}