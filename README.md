# Introduction:

This SDK simplifies integration steps with [HLS.js](https://github.com/video-dev/hls.js), enabling the collection of player analytics. It enables automatic tracking of video performance metrics, making the data readily available on the [FastPix dashboard](https://dashbord.fastpix.io) for monitoring and analysis. While the SDK is developed in TypeScript, the published npm package currently includes only the JavaScript output. TypeScript support, including type definitions, will be released in a future version.

# Key Features:

- **User Engagement Metrics:** Capture detailed viewer interaction data.
- **Playback Quality Monitoring:** Real-time performance analysis of your video streams.
- **Web Performance Insights:** Identify and resolve bottlenecks affecting video delivery.
- **Customizable Tracking:** Flexible configuration to match your specific monitoring needs.
- **Error Management:** Robust error handling and reporting.
- **Streaming Diagnostics:** Gain deep insights into the performance of your video streaming.

# Prerequisites:

## Getting started with FastPix:

To track and analyze video performance, initialize the FastPix Data SDK with your Workspace key:

1. **[Access the FastPix Dashboard](https://dashbord.fastpix.io)**: Log in and navigate to the Workspaces section.
2. **Locate Your Workspace Key**: Copy the Workspace Key for client-side monitoring. Include this key in your JavaScript code on every page where you want to track video performance.

# Installation:

To get started with the SDK, install using npm or your favourite node package manager 😉:

```bash
npm i @fastpix/data-core
```

# Basic Usage:

## Import

```javascript
import fastpixMetrix from "@fastpix/data-core";
```

## Usage

`workspace_id` is the only required field during initialization, you can also include other optional metadata to customize your tracking. For a comprehensive list of all the additional metadata options supported by the FastPix Data SDK, refer to the [User Passable Metadata](https://docs.fastpix.io/docs/user-passable-metadata) section.

When configuring the SDK, include both the `hlsjs` instance and the `Hls` constructor in the options.

Here's how you can quickly integrate FastPix Data SDK into your application to track and analyze video performance with ease:

### React

Integrate the following React code into your application to configure HLS with FastPix:

```jsx
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import fastpixMetrix from "@fastpix/data-core";

export default function VideoPlayer() {
  const videoElementRef = useRef(null);

  // Replace the URL below with your actual stream URL
  const videoSourceUrl =
    "https://stream.fastpix.io/027a90e4-f5e2-433d-81e5-b99ee864c3f6.m3u8";

  useEffect(() => {
    let hlsInstance;

    if (videoElementRef.current) {
      const videoElement = videoElementRef.current;
      const playerInitTime = fastpixMetrix.utilityMethods.now();

      if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = videoSourceUrl; // For Safari, which has native HLS support
      } else if (Hls.isSupported()) {
        // For other browsers using Hls.js
        hlsInstance = new Hls();
        hlsInstance.loadSource(videoSourceUrl);
        hlsInstance.attachMedia(videoElement);

        fastpixMetrix.tracker(videoElement, {
          debug: false,
          hlsjs: hlsInstance,
          Hls,
          data: {
            workspace_id: "WORKSPACE_KEY", // Replace with your workspace key
            player_name: "Main Player", // Identifier for this player instance
            player_init_time: playerInitTime,

            // ... and other metadata
          },
        });
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [videoElementRef]);

  return (
    <video
      controls
      ref={videoElementRef}
      style={{ width: "100%", maxWidth: "500px" }}
    />
  );
}
```

### JavaScript

Include the following JavaScript code in your application to set up the HLS with FastPix:

```javascript
import Hls from "hls.js";
import fastpixMetrix from "@fastpix/data-core";

document.addEventListener("DOMContentLoaded", function () {
  const videoElement = document.getElementById("#my-player");

  // Replace the URL below with your actual stream URL
  const videoSourceUrl =
    "https://stream.fastpix.io/027a90e4-f5e2-433d-81e5-b99ee864c3f6.m3u8";
  const playerInitTime = fastpixMetrix.utilityMethods.now();
  let hls;

  if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {

    // For Safari browsers with native HLS support
    videoElement.src = videoSourceUrl;
  } else if (Hls.isSupported()) {

    // For other browsers with Hls.js support
    hls = new Hls();
    hls.loadSource(videoSourceUrl);
    hls.attachMedia(videoElement);
  }

  // Initialize analytics tracking
  const initAnalytics = function () {
    fastpixMetrix.tracker(videoElement, {
      debug: false,
      hlsjs: hls,
      Hls: Hls,
      data: {
        workspace_id: "WORKSPACE_KEY", // Replace with your workspace key
        player_name: "Main Player",
        player_init_time: playerInitTime,

        // ... and other metadata
      },
    });
  };

  // Run analytics tracking once Hls.js is set up or for Safari's native support
  if (videoElement.canPlayType("application/vnd.apple.mpegurl") || hls) {
    initAnalytics();
  }

  // Clean up HLS instance on page unload
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
```

### HTML

Include the HTML code below to integrate HLS with FastPix:

```html
<video id="my-player" controls width="660" height="380" />

<script>
  const playerInitTime = fastpixMetrix.utilityMethods.now(); // Track player initialization time
  const videoEl = document.querySelector("#my-player"); // Select the video element

  if (Hls.isSupported()) {

    // Check if HLS is supported in the browser
    let hls = new Hls();
    hls.loadSource(
      "https://stream.fastpix.io/027a90e4-f5e2-433d-81e5-b99ee864c3f6.m3u8" // Replace the URL below with your actual stream URL,
    );
    hls.attachMedia(videoEl);

    if (window && window.fastpixMetrix) {

      // Start tracking video analytics
      fastpixMetrix.tracker(videoEl, {
        hlsjs: hls, // Pass the HLS.js instance to analytics
        Hls: Hls, // Pass HLS.js to analytics for reference
        debug: true,
        data: {
          workspace_id: "WORKSPACE_KEY", // Replace with your workspace key
          player_init_time: playerInitTime, // Time when the player was initialized
          video_title: "core player", // Title of the video

          // ... and other metadata
        },
      });
    }
  }
</script>
```

# Changing Video Streams

When playing multiple videos back-to-back, notify the FastPix SDK whenever a new video starts to ensure accurate tracking.

### When to Signal a New Source:

- The player advances to the next video in a playlist.
- The user selects a different video to play.

### Emitting a `videoChange` Event:

To inform the FastPix SDK of a new view, emit a `videoChange` event immediately after loading the new video source:

```javascript
// videoElement is the HTML5 <video> element representing your video player.
const videoElement = document.getElementById("#my-player");

videoElement.fp.dispatch("videochange", {
  video_id: "abc345", // Unique identifier for the new video
  video_title: "My Other Great Video", // Title of the new video
  video_series: "Weekly Great Videos", // Series name if applicable

  // Additional metadata can be included here
});
```

# Advanced Options for FastPix Integration

### 1. Disable Cookies

By default, FastPix uses cookies to track playback across page views. To disable this feature, set `disableCookies: true`.

```javascript
// videoElement is the HTML5 <video> element representing your video player.
const videoElement = document.getElementById("#my-player");

fastpixMetrix.tracker(videoElement, {
  debug: false,
  hlsjs: hls,
  Hls: Hls,
  disableCookies: true,
  data: {
    workspace_id: "WORKSPACE_KEY", // Replace with your workspace key

    // ... and other metadata
  },
});
```

### 2. Override “Do Not Track” Behaviour

FastPix does not respect the 'Do Not Track' setting by default. If you want to honor users privacy preferences, enable this feature by passing `respectDoNotTrack: true`.

```javascript
// videoElement is the HTML5 <video> element representing your video player.
const videoElement = document.getElementById("#my-player");

fastpixMetrix.tracker(videoElement, {
  debug: false,
  hlsjs: hls,
  Hls: Hls,
  respectDoNotTrack: true,
  data: {
    workspace_id: "WORKSPACE_KEY", // Replace with your workspace key

    // ... and other metadata
  },
});
```

### 3. Customized Error Tracking Behaviour

Errors tracked by FastPix are considered fatal. If you encounter non-fatal errors that should not be captured, you can emit a custom error event to provide more context.

```javascript
// videoElement is the HTML5 <video> element representing your video player.
const videoElement = document.getElementById("#my-player");

videoElement.fp.dispatch("error", {
  player_error_code: 1000, // Custom error code
  player_error_message: "Description of error", // Generalized error message
  player_error_context: "Additional context for the error", // Instance-specific information
});
```

### 4. Disable Automatic Error Tracking

For complete control over which errors are counted as fatal, consider disabling automatic error tracking by setting `automaticErrorTracking: false`.

```javascript
// videoElement is the HTML5 <video> element representing your video player.
const videoElement = document.getElementById("#my-player");

fastpixMetrix.tracker(videoElement, {
  debug: false,
  hlsjs: hls,
  Hls: Hls,
  automaticErrorTracking: false,
  data: {
    workspace_id: "WORKSPACE_KEY", // Replace with your workspace key

    // ... and other metadata
  },
});
```

# Detailed Usage:

For more detailed steps and advanced usage, please refer to the official [FastPix Documentation](https://docs.fastpix.io/docs/monitor-hlsjs).
