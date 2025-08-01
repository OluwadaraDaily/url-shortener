# URL Shortener Feature List

I want to use this document to keep track of all features built in this project

- Creating short links for URL by mapping it to a short code
- I had to handle implementing a function to ensure no short code clashes including a means of extending the function for scalability
- Implemented a redirect function to redirect URL if shortcode passed is present
- Handle URL click logging to ensure I capture all devices that click on that link and leave a documentation of who they are
- Handle private IPs in tracking click logging
- Implemented a table to store daily tracking data to give an historical idea of click logs for every URL. The table also includes other valuable insights like: unique visitors, country distribution, etc.
