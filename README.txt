Quick Guide — Project Structure and Where to Put Videos
==============================================

1) Directory Structure:
   video-scroll-crossfade/
   ├─ index.html         ← Ready site file
   └─ videos/            ← Place your video files here

2) Video Filenames (default in the code):
   videos/video1.mp4   (loops when site loads)
   videos/video2.mp4   (plays once → then video3 loops)
   videos/video3.mp4   (loops)
   videos/video4.mp4   (plays once → then video1 loops)

   You can change the paths/filenames inside index.html in the SOURCES object.

3) Operation:
   - Open index.html in a browser.
   - If the browser blocks autoplay, a single click on the page will start playback.

4) Notes:
   - The crossfade is 1 second between each transition.
   - When a one-time video plays (2 or 4), scrolling during playback will have no effect until it finishes.
   - You can modify the logic/transitions in the JS code as needed.
