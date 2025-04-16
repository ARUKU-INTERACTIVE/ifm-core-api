export class SorobanErrorMap {
  ContractInitialized = 0;
  ContractNotInitialized = 1;
  NonExistentUser = 2;
  IdAlreadyExists = 3;
  InvalidAmount = 5;
  AuctionNotFound = 6;
  AuctionAlreadyClosed = 7;
  AuctionInProgress = 8;
  InsufficientFunds = 9;
  BidTooLow = 10;
  InvalidUser = 11;
  UnauthorizedSeller = 12;
  FundsReturnedAlready = 14;
  NFTAlreadyClaimed = 15;
  CannotBidOnOwnAuction = 16;
  TokenInsufficientFunds = 17;

  getName(code: number): string {
    for (const [key, value] of Object.entries(this)) {
      if (value === code) {
        return key;
      }
    }
    return 'Unknown Error';
  }

  errorStringSorobanToObject(errorString: string) {
    const error: {
      contractId: string;
      errorCode: number;
      method: string;
      events: string[];
    } = {
      contractId: null,
      errorCode: null,
      method: null,
      events: [],
    };

    const errorMatch = errorString.match(/Error\(Contract, #(\d+)\)/);
    if (errorMatch) {
      error.errorCode = parseInt(errorMatch[1]);
    }

    const contractMatch = errorString.match(/CC[A-Z0-9]{54}/);
    if (contractMatch) {
      error.contractId = contractMatch[0];
    }

    const fnMatch = errorString.match(
      /topics:\[fn_call, [A-Z0-9]+, ([a-z_]+)\]/,
    );
    if (fnMatch) {
      error.method = fnMatch[1];
    }

    const eventLines = errorString.match(/\[Diagnostic Event\].+/g) || [];
    error.events = eventLines.map((line) => line.trim());

    return error;
  }
}
