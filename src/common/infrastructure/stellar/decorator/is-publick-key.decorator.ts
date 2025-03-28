import { StrKey } from '@stellar/stellar-sdk';
import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

const { isValidEd25519PublicKey } = StrKey;
@ValidatorConstraint({ async: false })
class IsStellarPublicKeyConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return typeof value === 'string' && isValidEd25519PublicKey(value);
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Invalid Stellar public key';
  }
}

export function IsStellarPublicKey(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStellarPublicKeyConstraint,
    });
  };
}
