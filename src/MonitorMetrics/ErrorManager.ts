interface ErrorData {
  playerErrorCode?: string;
  playerErrorMessage?: string;
  playerErrorContext?: string;
}

interface AccuracyData {
  data: ErrorData;
  userConfigData?: {
    actionableData?: {
      debug?: boolean;
    };
  };
}

export class ErrorManager {
  accuracy: AccuracyData;
  eventEmitter: any;
  hasErrorOccurred: boolean;

  constructor(accuracy: AccuracyData, eventEmitter: any) {
    this.accuracy = accuracy;
    this.eventEmitter = eventEmitter;
    this.hasErrorOccurred = false;
    this.setupEventListeners();
  }

  setupEventListeners(): void {
    this.eventEmitter.on("configureView", () => {
      this.hasErrorOccurred = false;
    });

    this.eventEmitter.on("error", (errorInfo: ErrorData) => {
      try {
        if (
          errorInfo.playerErrorCode ||
          errorInfo.playerErrorMessage ||
          errorInfo.playerErrorContext
        ) {
          this.accuracy.data.playerErrorCode = errorInfo.playerErrorCode ?? "";
          this.accuracy.data.playerErrorMessage =
            errorInfo.playerErrorMessage ?? "";
          this.accuracy.data.playerErrorContext =
            errorInfo.playerErrorContext ?? "";
          this.hasErrorOccurred = true;
        } else {
          delete this.accuracy.data.playerErrorCode;
          delete this.accuracy.data.playerErrorMessage;
          delete this.accuracy.data.playerErrorContext;
        }
      } catch (err) {
        if (this.accuracy.userConfigData?.actionableData?.debug) {
          console.warn(
            "Exception raised within the error handler callback",
            err,
          );
        }
        this.hasErrorOccurred = true;
      }
    });
  }
}
