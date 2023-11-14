declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_URL: string;
      DIRECT_URL: string;
      STRIPE_SECRET_KEY: string;
      METRICS_PORT: number;
      DATABASE_URL: string;
      CF_SECRET_KEY: string;
      RESEND_API_KEY: string;
      SESSION_SECRET: string;
    }
  }
}

export {};
