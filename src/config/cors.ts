import cors from 'cors';

const allowedOrigins =
  process.env.CORS_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error('Origin not allowed by CORS'),
    );
  },

  credentials: true,
};

export default cors(corsOptions);