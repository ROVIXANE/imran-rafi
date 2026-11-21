/* Runtime configuration.
   This file is deliberately empty in the repository: no credentials are stored here.
   The GitHub Actions workflow regenerates it from repository secrets on every deploy.
   For local testing, copy js/config.example.js to js/config.js and fill in your values. */
window.APP_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  mediaBucket: "portfolio-media"
};
