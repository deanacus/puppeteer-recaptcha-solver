# Puppeteer Recaptcha Solver for COD Attempt

A fork of https://github.com/danielgatis/puppeteer-recaptcha-solver in an
attempt to make it work without triggering cross-domain issues for me locally.

You may or may not get video recordings... depends on if the plugin installs
ffmpeg for you or not (I had it installed already, so i could give it a path).

To run the recaptcha demo, run `node demo` and to run the cod attempt, run
`node cod`

cod is using my edited `solver.js`, and the demo is running the original
