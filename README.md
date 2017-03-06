# World's slowest server.  

## Setup

```
npm install
node server.js 
```

Then visit [http://localhost:5000](http://localhost:5000).

Open the developer tools network tab to observe the loading process.


## Configuation

In server.js alter

```js
THROTTLE_SPEED = 20000; // bps
RESPONSE_DELAY = 3000; // ms
```


* THROTTLE speed controls the number of bytes (per connection) sent over the wire.
* RESPONSE_DELAY controls how long before the server initially responds to a request.  


Both of these are useful for demonstration purposes.  

[Google](https://research.googleblog.com/2009/06/speed-matters.html) has shown a measurable decrease in user interest as display speed was slowed by only 100-400ms

