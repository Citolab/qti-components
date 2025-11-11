export interface ModuleResolutionConfig {
  waitSeconds?: number;
  context?: string;
  catchError?: boolean;
  paths: {
    [key: string]: string;
  };
}
