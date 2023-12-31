# critical-css

This little script is here to help you with finding critical CSS on your website.

When calling the script, you have four possible named arguments.

```
sitemapUrl <- required
viewportWidth <- defaults to 1000. Only enter an integer. do not append "px"
viewportHeight <- defaults to 1000. Only enter an integer. do not append "px"
userAgent <- defaults to My-User-Agent. Do not use quotes.
```` 

## How it works

The app will get all URLs from the sitemap you provided with the sitemapUrl argument. This can either be a sitemap index file, or a regular sitemap file. In case it is a sitemap index file, it will extract all URLs from the sitemaps referenced in the sitemap index file.

After that, it will loop through all URLs it has extracted and open a puppeteer headless browser. It will send the UserAgent string you gave, and set the Viewport of the browser to the dimensions you have provided. If none are provided, the default values are being used.

For each URL, all CSS classes used on HTML elements which are visible within the viewport area are being extracted.

After all URLs have been rendered and the CSS classes have been extracted, the app will write a file called domain-name.com-ATF-CSS.csv. All CSS classes used above the fold on your entire website are added to the file for you to work with.

## How to use it?

To use the script, you need to have nodejs installed on your machine.

Create a directory on your computer for this script to run in. For this example, we will call it critical-css.

```mkdir critical-css```

Now open your code editor and open the directory you have just created.
Also, open your console / terminal and cd into the directory.

For this script to run, you need to install a few dependencies.

```npm install puppeteer cheerio xml2js sitemapper fs```

Once you are done with this, you are ready to create the script file. In your editor, create a new file called app.js and open it. Copy the code below and paste it into your JS file. Save it 🙂

Now you simply go back to your terminal and call the script.

```node app.js sitemapUrl=https://www.screamingfrog.co.uk/sitemap.xml viewportHeight=800 viewportWidth=800  userAgent=CHRIS-SEO```

You can set the ```viewportHeight``` and ```viewportWidth```, so you can check what CSS is visible in different scenarios.

Fee free to contribute to this to make it really helpful.