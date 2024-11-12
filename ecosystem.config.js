module.exports = {
  apps: [
    {
      name: "playce",
      script: "dist/apps/playce/main.js",
      instances: 1,
      env: {
        port: "4000",
        NODE_ENV: "development",
      },
      env_stage: {
        port: "4000",
        NODE_ENV: "stage",
      },
    },
  ],
};
